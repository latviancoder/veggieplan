import { getObjectAtPoint } from './../utils';
import { Modes, ObjectTypes, Plant } from './../types';
import { atom } from 'jotai';
import { Point } from '../types';
import { zoomAtom } from './zoomAtom';
import { selectedPlantAtom, modeAtom } from './atoms';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';
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
    const selectedObjectIds = get(selectedObjectIdsAtom);
    const selectedPlant = get(selectedPlantAtom);

    if (selectedPlant) {
      const plant = getPlant(selectedPlant);
      const spacingInPx = meterToPx(plant.spacing / 100) / zoom;

      const now = new Date();

      const creatable: Plant = {
        id: nanoid(),
        rotation: 0,
        objectType: ObjectTypes.Plant,
        plantId: selectedPlant,
        x: absoluteToRelativeX(center.x) - spacingInPx / 2,
        y: absoluteToRelativeY(center.y) - spacingInPx / 2,
        width: spacingInPx,
        height: spacingInPx,
        dateAdded: now.toISOString(),
        sorting: now.getTime() / Math.pow(10, now.getTime().toString().length),
      };

      set(objectsAtom, { objects: [...objects, creatable] });
      set(selectedObjectIdsAtom, {
        type: 'reset-add',
        objectIds: [creatable.id],
      });
      set(selectedPlantAtom, null);
      set(modeAtom, Modes.DEFAULT);

      return;
    }

    const tappedObject = getObjectAtPoint({
      point: {
        x: absoluteToRelativeX(center.x),
        y: absoluteToRelativeY(center.y),
      },
      objects,
      offset: 2 / zoom,
    });

    if (tappedObject) {
      const tappedObjectId = tappedObject.id;

      if (!shiftPressed) {
        // Single selection
        set(selectedObjectIdsAtom, {
          type: 'reset-add',
          objectIds: [tappedObjectId],
        });
      } else {
        // Multi selection
        if (selectedObjectIds?.includes(tappedObjectId)) {
          // Remove object from selection
          set(selectedObjectIdsAtom, {
            type: 'remove',
            objectIds: [tappedObjectId],
          });
        } else {
          // Add another object to selection
          set(selectedObjectIdsAtom, {
            type: 'add',
            objectIds: [tappedObjectId],
          });
        }
      }
    } else {
      if (!shiftPressed) {
        set(selectedObjectIdsAtom, { type: 'reset' });
      }
    }
  }
);
