import { useAtomValue } from 'jotai/utils';
import { useEffect, useRef } from 'react';
import { modeAtom } from '../../atoms/atoms';
import { objectsAtom } from '../../atoms/objectsAtom';
import { GardenObject, Modes } from '../../types';
import deepEqual from 'deep-equal';
import { useMutation } from 'react-query';
import { useUtils } from '../../utils';
import produce from 'immer';

// let timeout: NodeJS.Timeout;

export const Autosave = () => {
  const { pxToMeter } = useUtils();

  const { mutate: save } = useMutation<
    {},
    string,
    { changedObjects: GardenObject[]; deletedObjectIds: string[] | undefined }
  >(({ changedObjects, deletedObjectIds }) =>
    fetch('/api/save', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        changedObjects: changedObjects.map((obj) =>
          produce(obj, (draft) => {
            draft.x = pxToMeter(draft.x, true);
            draft.y = pxToMeter(draft.y, true);
            draft.width = pxToMeter(draft.width, true);
            draft.height = pxToMeter(draft.height, true);
          })
        ),
        deletedObjectIds,
      }),
    })
  );

  const prevObjects = useRef<GardenObject[]>();

  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsAtom);

  useEffect(() => {
    if (
      mode !== Modes.MOVEMENT &&
      mode !== Modes.RESIZING &&
      (!prevObjects.current || !deepEqual(objects, prevObjects.current))
    ) {
      // Removed object ids
      const deletedObjectIds = prevObjects.current
        ?.filter(
          ({ id }) => !objects.find(({ id: deletedId }) => id === deletedId)
        )
        .map(({ id }) => id);

      // Changed/added objects
      const changedObjects = objects.filter(
        (obj) =>
          !deepEqual(
            obj,
            prevObjects.current?.find(({ id }) => id === obj.id)
          )
      );

      if (changedObjects.length || deletedObjectIds?.length) {
        save({ changedObjects, deletedObjectIds });
      }

      prevObjects.current = objects;

      //   clearTimeout(timeout);

      //   timeout = setTimeout(() => {
      // console.log('save 5 sec after last change in objects');
      // console.log(objects);
      //   }, 5000);
    }
  }, [mode, objects, save]);

  // todo some autosave
  return null;
};
