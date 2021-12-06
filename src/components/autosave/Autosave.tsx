import { diff } from 'deep-diff';
import deepEqual from 'deep-equal';
import produce from 'immer';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useMutation, useQuery } from 'react-query';

import { canvasAtom, modeAtom } from '../../atoms/atoms';
import { objectsAtom } from '../../atoms/objectsAtom';
import { GardenObject, Modes } from '../../types';
import { post, useUtils } from '../../utils';

let timeout: NodeJS.Timeout;

type StateSnapshot = {
  objects?: GardenObject[];
};

const MAX_UNDO_STACK = 3;

export const useUndoRedo = () => {
  const { pxToMeter, meterToPx } = useUtils();
  const setObjects = useUpdateAtom(objectsAtom);
  const [undoStack, setUndoStack] = useState<StateSnapshot[]>([]);
  const initialRender = useRef<boolean>(true);
  const canvas = useAtomValue(canvasAtom);

  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsAtom);

  const prevObjects = useRef<GardenObject[]>(objects);

  const undo = () => {
    if (undoStack.length > 1) {
      undoStack.pop();
      const prevState = undoStack[undoStack.length - 1];

      if (prevState.objects) {
        prevObjects.current = prevState.objects.map((obj) =>
          produce(obj, (draft) => {
            draft.x = meterToPx(draft.x, true);
            draft.y = meterToPx(draft.y, true);
            draft.width = meterToPx(draft.width, true);
            draft.height = meterToPx(draft.height, true);
          })
        );

        setObjects({
          type: 'replaceAll',
          payload: prevState.objects,
          units: 'meters',
        });
      }
    }
  };

  const createStateSnapshot = useCallback(
    (): StateSnapshot => ({
      objects: objects.map((obj) =>
        produce(obj, (draft) => {
          draft.x = pxToMeter(draft.x, true);
          draft.y = pxToMeter(draft.y, true);
          draft.width = pxToMeter(draft.width, true);
          draft.height = pxToMeter(draft.height, true);
        })
      ),
    }),
    [objects, pxToMeter]
  );

  useHotkeys('ctrl+z, cmd+z', () => void undo(), [undoStack]);

  useEffect(() => {
    if (objects.length && initialRender.current && !isEmpty(canvas)) {
      prevObjects.current = objects;
      initialRender.current = false;
      setUndoStack([createStateSnapshot()]);
    }
  }, [createStateSnapshot, objects, canvas]);

  useEffect(() => {
    if (
      !initialRender.current &&
      mode !== Modes.MOVEMENT &&
      mode !== Modes.RESIZING &&
      mode !== Modes.ROTATION &&
      !deepEqual(
        objects.map((obj) => ({ ...obj, zIndex: undefined })),
        prevObjects.current.map((obj) => ({ ...obj, zIndex: undefined }))
      )
    ) {
      setUndoStack((currentStack) => {
        if (currentStack.length > MAX_UNDO_STACK) {
          currentStack.shift();
        }

        return [...currentStack, createStateSnapshot()];
      });

      prevObjects.current = objects;
    }
  }, [createStateSnapshot, mode, objects, pxToMeter, undoStack]);
};

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
          objects.map((obj) => ({ ...obj, zIndex: undefined })),
          prevObjects.current?.map((obj) => ({ ...obj, zIndex: undefined }))
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
