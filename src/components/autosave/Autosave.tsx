import deepEqual from 'deep-equal';
import produce from 'immer';
import { useAtomValue } from 'jotai/utils';
import { useEffect, useRef } from 'react';
import { useMutation } from 'react-query';

import { modeAtom } from '../../atoms/atoms';
import { objectsAtom } from '../../atoms/objectsAtom';
import { GardenObject, Modes } from '../../types';
import { post, useUtils } from '../../utils';

let timeout: NodeJS.Timeout;

export const Autosave = () => {
  const initialRender = useRef<boolean>(true);
  const { pxToMeter } = useUtils();

  const { mutate: save } = useMutation<
    unknown,
    string,
    { changedObjects: GardenObject[]; deletedObjectIds: string[] | undefined }
  >(({ changedObjects, deletedObjectIds }) =>
    post('/api/save', {
      changedObjects: changedObjects.map((obj) =>
        produce(obj, (draft) => {
          draft.x = pxToMeter(draft.x, true);
          draft.y = pxToMeter(draft.y, true);
          draft.width = pxToMeter(draft.width, true);
          draft.height = pxToMeter(draft.height, true);
        })
      ),
      deletedObjectIds,
    })
  );

  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsAtom);

  const prevSavedObjects = useRef<GardenObject[]>(objects);

  useEffect(() => {
    if (objects.length && initialRender.current) {
      prevSavedObjects.current = objects;
      initialRender.current = false;
    }
  }, [objects]);

  // Autosave doesn't get triggered for volatile state changes like movement and resizing.
  // Additionally there is a debounce.
  useEffect(() => {
    if (
      mode !== Modes.MOVEMENT &&
      mode !== Modes.RESIZING &&
      (!prevSavedObjects.current ||
        !deepEqual(objects, prevSavedObjects.current))
    ) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const deletedObjectIds = prevSavedObjects.current
          ?.filter(
            ({ id }) => !objects.find(({ id: deletedId }) => id === deletedId)
          )
          .map(({ id }) => id);

        const changedObjects = objects.filter(
          (obj) =>
            !deepEqual(
              obj,
              prevSavedObjects.current?.find(({ id }) => id === obj.id)
            )
        );

        save({ changedObjects, deletedObjectIds });

        prevSavedObjects.current = objects;
      }, 2000);
    }
  }, [mode, objects, save]);

  // todo some autosave
  return null;
};
