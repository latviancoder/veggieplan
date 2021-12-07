import { canvasAtom, modeAtom } from 'atoms/atoms';
import { objectsAtom } from 'atoms/objectsAtom';
import deepEqual from 'deep-equal';
import produce from 'immer';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import sortBy from 'lodash.sortby';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { GardenObject, Modes } from 'types';
import { useUtils } from 'utils';

type StateSnapshot = {
  objects?: GardenObject[];
};

const MAX_UNDO_STACK = 30;

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
    // console.log({ undoStack });
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
        sortBy(
          objects.map((obj) => ({ ...obj, zIndex: undefined })),
          'id'
        ),
        sortBy(
          prevObjects.current.map((obj) => ({ ...obj, zIndex: undefined })),
          'id'
        )
      )
    ) {
      // console.log('set undo');
      // console.log({ prev: prevObjects.current, objects });
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
