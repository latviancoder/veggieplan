import { atom } from 'jotai';
import { GardenObject, Point } from '../types';
import { zoomAtom } from './zoomAtom';
import { isPointInsideRectangle } from '../utils';
import { canvasAtom, offsetAtom } from './atoms';
import { selectionAtom } from './selectionAtom';
import produce from 'immer';
import { objectsAtom } from './objectsAtom';

type Params = {
  center: Point;
  shiftPressed: boolean;
};

export const tapAtom = atom<unknown, Params>(
  null,
  (get, set, { center, shiftPressed }) => {
    const zoom = get(zoomAtom);
    const offset = get(offsetAtom);
    const canvas = get(canvasAtom);
    const objects = get(objectsAtom);
    const selection = get(selectionAtom);

    let tappedObject: GardenObject | null = null;

    for (let obj of objects) {
      if (
        isPointInsideRectangle({
          point: {
            x: (center.x - canvas.x) / zoom + offset.x,
            y: (center.y - canvas.y) / zoom + offset.y,
          },
          rectangle: obj,
          offset: 2 / zoom,
        })
      ) {
        tappedObject = obj;
      }
    }

    if (tappedObject) {
      const tappedId = tappedObject.id;

      if (!shiftPressed) {
        // Single selection
        set(selectionAtom, { type: 'reset-add', objectIds: [tappedId] });
      } else {
        // Multi selection
        if (selection?.includes(tappedId)) {
          // Remove object from selection
          set(selectionAtom, { type: 'remove', objectIds: [tappedId] });
        } else {
          // Add another object to selection
          set(selectionAtom, { type: 'add', objectIds: [tappedId] });
        }
      }
    } else {
      if (!shiftPressed) {
        set(selectionAtom, { type: 'reset' });
      }
    }
  }
);
