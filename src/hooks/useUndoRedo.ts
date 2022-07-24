import { objectsInMetersAtom } from './../atoms/objectsAtom';
import { canvasAtom, modeAtom } from 'atoms/atoms';
import { objectsAtom } from 'atoms/objectsAtom';
import deepEqual from 'deep-equal';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { isEmpty, sortBy } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { GardenObject, Modes } from 'types';

type StateSnapshot = {
  objects?: GardenObject[];
};

const MAX_UNDO_STACK = 30;

export const useUndoRedo = () => {
  const setObjects = useUpdateAtom(objectsAtom);
  const [undoStack, setUndoStack] = useState<StateSnapshot[]>([]);
  const initialRender = useRef<boolean>(true);
  const canvas = useAtomValue(canvasAtom);

  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsInMetersAtom);

  const prevObjects = useRef<GardenObject[]>(objects);

  const undo = () => {
    if (undoStack.length > 1) {
      undoStack.pop();
      const prevState = undoStack[undoStack.length - 1];

      if (prevState.objects) {
        prevObjects.current = prevState.objects;

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
      objects,
    }),
    [objects]
  );

  useHotkeys('ctrl+z, cmd+z', () => void undo(), [undoStack]);

  useEffect(() => {
    if (initialRender.current && !isEmpty(canvas)) {
      // console.log('set undo stack 1');
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
      // console.log('+ undo stack');
      setUndoStack((currentStack) => {
        if (currentStack.length > MAX_UNDO_STACK) {
          currentStack.shift();
        }

        return [...currentStack, createStateSnapshot()];
      });

      prevObjects.current = objects;
    }
  }, [createStateSnapshot, mode, objects, undoStack]);
};
