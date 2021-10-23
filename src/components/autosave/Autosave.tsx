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

  const prevObjects = useRef<GardenObject[]>();

  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsAtom);

  // Autosave doesn't get triggered for volatile state changes like movement and resizing.
  // Additionally there is a debounce.
  useEffect(() => {
    if (
      mode !== Modes.MOVEMENT &&
      mode !== Modes.RESIZING &&
      (!prevObjects.current || !deepEqual(objects, prevObjects.current))
    ) {
      const deletedObjectIds = prevObjects.current
        ?.filter(
          ({ id }) => !objects.find(({ id: deletedId }) => id === deletedId)
        )
        .map(({ id }) => id);

      const changedObjects = objects.filter(
        (obj) =>
          !deepEqual(
            obj,
            prevObjects.current?.find(({ id }) => id === obj.id)
          )
      );

      if (changedObjects.length || deletedObjectIds?.length) {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          save({ changedObjects, deletedObjectIds });
        }, 2000);
      }

      prevObjects.current = objects;
    }
  }, [mode, objects, save]);

  // todo some autosave
  return null;
};
