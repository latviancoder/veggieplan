import produce from 'immer';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { isArray, sortBy } from 'lodash';

import { GardenObject } from 'types';

import { hiddenObjectIdsAtom } from './atoms';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';
import { utilsAtom } from './utilsAtom';

const _objectsAtom = atomWithStorage<GardenObject[]>('objects', []);

type SetParams = (
  | {
      type: 'replaceAll';
      payload: GardenObject[];
    }
  | {
      type: 'append';
      payload: GardenObject | GardenObject[];
    }
  | {
      type: 'updateSingle';
      payload: {
        object: Partial<GardenObject>;
        id: string;
      };
    }
) & { units?: 'pixels' | 'meters' };

export const objectsInMetersAtom = atom<GardenObject[], SetParams>(
  (get) => {
    const selectedObjectIds = get(selectedObjectIdsAtom);
    const hiddenObjectIds = get(hiddenObjectIdsAtom);

    let objects = get(_objectsAtom);

    objects = objects.map((obj) =>
      produce(obj, (draft) => {
        const isSelected = selectedObjectIds.includes(draft.id);

        draft.zIndex = isSelected
          ? selectedObjectIds.indexOf(draft.id) + 1
          : undefined;

        if (hiddenObjectIds?.includes(draft.id)) {
          draft.zIndex = -1;
        }
      })
    );

    return sortBy(objects, ({ zIndex, sorting }) =>
      zIndex ? zIndex : sorting
    );
  },
  (get, set, params) => {
    const units = params.units ?? 'pixels';

    const { pxToMeter } = get(utilsAtom);
    const currentObjects = get(objectsAtom);

    let newObjects: GardenObject[] = [];

    if (params.type === 'replaceAll') {
      newObjects = params.payload;
    }

    if (params.type === 'append') {
      newObjects = isArray(params.payload)
        ? [...currentObjects, ...params.payload]
        : [...currentObjects, params.payload];
    }

    if (params.type === 'updateSingle') {
      newObjects = produce(currentObjects, (draft) => {
        const i = currentObjects.findIndex(
          ({ id }) => id === params.payload.id
        );

        // @ts-ignore
        draft[i] = {
          ...draft[i],
          ...params.payload.object,
        };
      });
    }

    /*
    Internally and in the database object dimensions are using meters, 
    but when working in the app it's convinient to have pixels.

    When saving objects to the store we convert dimensions to meters and we ignore current zoom value.

    This behaviour is skipped when the values passed are already in meters.
    For example this could happen when store is initially hydrated with objects from the DB.
    */
    if (units === 'pixels') {
      set(
        _objectsAtom,
        newObjects.map((obj) =>
          produce(obj, (draft) => {
            draft.x = pxToMeter(draft.x, true);
            draft.y = pxToMeter(draft.y, true);
            draft.width = pxToMeter(draft.width, true);
            draft.height = pxToMeter(draft.height, true);
          })
        )
      );
    } else {
      set(_objectsAtom, newObjects);
    }
  }
);

// Internally and in the database object dimensions are using meters,
// but when working in the app it's convinient to have pixels.
export const objectsAtom = atom<GardenObject[], SetParams>(
  (get) => {
    const { meterToPx } = get(utilsAtom);

    let objects = get(objectsInMetersAtom);

    return objects.map((obj) =>
      produce(obj, (draft) => {
        draft.x = meterToPx(draft.x, true);
        draft.y = meterToPx(draft.y, true);
        draft.width = meterToPx(draft.width, true);
        draft.height = meterToPx(draft.height, true);
      })
    );
  },
  (get, set, params) => {
    set(objectsInMetersAtom, params);
  }
);
