import { Modes, ObjectTypes, Plant } from './../types';
import { atom } from 'jotai';
import { GardenObject, Point } from '../types';
import { zoomAtom } from './zoomAtom';
import { isPointInsideRectangle } from '../utils';
import { selectedPlantAtom, modeAtom } from './atoms';
import { selectionAtom } from './selectionAtom';
import { objectsAtom } from './objectsAtom';
import { nanoid } from 'nanoid';
import { utilsAtom } from './utilsAtom';

type Params = {
  center: Point;
  shiftPressed: boolean;
};

export const tapAtom = atom<unknown, Params>(
  null,
  (get, set, { center, shiftPressed }) => {
    const { absoluteToRelativeX, absoluteToRelativeY, meterToPx, getPlant } =
      get(utilsAtom);
    const zoom = get(zoomAtom);
    const objects = get(objectsAtom);
    const selection = get(selectionAtom);
    const selectedPlant = get(selectedPlantAtom);

    if (selectedPlant) {
      const plant = getPlant(selectedPlant);
      const spacingInPx = meterToPx(plant.spacing / 100);

      const creatable: Plant = {
        id: nanoid(),
        rotation: 0,
        objectType: ObjectTypes.Plant,
        plantID: selectedPlant,
        x: absoluteToRelativeX(center.x) - spacingInPx / 2,
        y: absoluteToRelativeY(center.y) - spacingInPx / 2,
        width: spacingInPx,
        height: spacingInPx,
        dateAdded: Date.now() / Math.pow(10, Date.now().toString().length),
      };

      set(objectsAtom, [...objects, creatable]);
      set(selectionAtom, { type: 'reset-add', objectIds: [creatable.id] });
      set(selectedPlantAtom, null);
      set(modeAtom, Modes.DEFAULT);

      return;
    }

    let tappedObject: GardenObject | null = null;

    for (let obj of objects) {
      if (
        isPointInsideRectangle({
          point: {
            x: absoluteToRelativeX(center.x),
            y: absoluteToRelativeY(center.y),
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
