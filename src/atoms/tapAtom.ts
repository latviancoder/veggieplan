import { atom } from 'jotai';
import { nanoid } from 'nanoid';

import { Modes, ObjectTypes, Plant, Point } from '../types';
import { getObjectAtPoint } from '../utils/utils';
import { modeAtom, selectedPlantAtom } from './atoms';
import { objectsAtom } from './objectsAtom';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';
import { utilsAtom } from './utilsAtom';
import { zoomAtom } from './zoomAtom';

type Params = {
  center: Point;
  shiftPressed: boolean;
};

export const tapAtom = atom<unknown, Params>(
  null,
  (get, set, { center, shiftPressed }) => {
    const {
      absoluteToRelativeX,
      absoluteToRelativeY,
      meterToPx,
      getPlantDetails,
    } = get(utilsAtom);
    const zoom = get(zoomAtom);
    const objects = get(objectsAtom);
    const selectedObjectIds = get(selectedObjectIdsAtom);
    const selectedPlantId = get(selectedPlantAtom);

    if (selectedPlantId) {
      const plantDetails = getPlantDetails(selectedPlantId);
      const spacingInPx = meterToPx(plantDetails.spacing / 100) / zoom;

      const now = new Date();

      const creatable: Plant = {
        id: nanoid(),
        rotation: 0,
        objectType: ObjectTypes.Plant,
        plantId: selectedPlantId,
        x: absoluteToRelativeX(center.x) - spacingInPx / 2,
        y: absoluteToRelativeY(center.y) - spacingInPx / 2,
        width: spacingInPx,
        height: spacingInPx,
        dateAdded: now.toISOString(),
        sorting: now.getTime() / Math.pow(10, now.getTime().toString().length),
      };

      set(objectsAtom, { type: 'append', payload: creatable });
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
