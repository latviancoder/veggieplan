import { canvasAtom, modeAtom } from 'atoms/atoms';
import { objectsAtom } from 'atoms/objectsAtom';
import deepEqual from 'deep-equal';
import produce from 'immer';
import { useAtomValue } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import sortBy from 'lodash.sortby';
import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'react-query';
import { GardenObject, Modes } from 'types';
import { post, useUtils } from 'utils';

let timeout: NodeJS.Timeout;

export const useAutosave = () => {
  const canvas = useAtomValue(canvasAtom);
  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsAtom);
  const { pxToMeter, meterToPx } = useUtils();

  const {
    isLoading: isObjectsLoading,
    data: objectsFromDb,
    refetch,
  } = useQuery<GardenObject[]>('objects', () =>
    fetch('/api/objects').then((res) => res.json())
  );

  const prevObjects = useRef<GardenObject[] | undefined>();

  prevObjects.current = objectsFromDb?.map((obj) =>
    produce(obj, (draft) => {
      draft.x = meterToPx(draft.x, true);
      draft.y = meterToPx(draft.y, true);
      draft.width = meterToPx(draft.width, true);
      draft.height = meterToPx(draft.height, true);
    })
  );

  const { mutate: save } = useMutation<
    unknown,
    string,
    { changedObjects: GardenObject[]; deletedObjectIds: string[] | undefined }
  >(
    ({ changedObjects, deletedObjectIds }) =>
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
      }),
    {
      onSuccess: () => refetch(),
    }
  );

  // Autosave doesn't get triggered for volatile state changes like movement and resizing.
  // Additionally there is a debounce.
  useEffect(() => {
    if (
      !isEmpty(canvas) &&
      !isObjectsLoading &&
      mode !== Modes.MOVEMENT &&
      mode !== Modes.RESIZING &&
      mode !== Modes.ROTATION &&
      (!prevObjects ||
        !deepEqual(
          sortBy(
            objects.map((obj) => ({ ...obj, zIndex: undefined })),
            'id'
          ),
          sortBy(
            prevObjects.current?.map((obj) => ({ ...obj, zIndex: undefined })),
            'id'
          )
        ))
    ) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const deletedObjectIds = prevObjects.current
          ?.filter(
            ({ id }) => !objects.find(({ id: deletedId }) => id === deletedId)
          )
          .map(({ id }) => id);

        const changedObjects = objects.filter((obj) => {
          if (
            !deepEqual(
              { ...obj, zIndex: undefined },
              {
                ...prevObjects.current?.find(({ id }) => id === obj.id),
                zIndex: undefined,
              }
            )
          ) {
            return true;
          }

          return false;
        });

        prevObjects.current = objects;

        save({ changedObjects, deletedObjectIds });
      }, 2000);
    }
  }, [mode, objects, save, isObjectsLoading, prevObjects, canvas]);
};
