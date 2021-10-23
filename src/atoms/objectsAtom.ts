import produce from 'immer';
import { atom } from 'jotai';
import isArray from 'lodash.isarray';
import sortBy from 'lodash.sortby';
import { type } from 'os';

import { GardenObject } from '../types';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';
import { utilsAtom } from './utilsAtom';

const _objectsAtom = atom<GardenObject[]>([]);

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

export const objectsAtom = atom<GardenObject[], SetParams>(
  (get) => {
    const selectedObjectIds = get(selectedObjectIdsAtom);
    const { meterToPx } = get(utilsAtom);

    const objects = get(_objectsAtom).map((obj) =>
      produce(obj, (draft) => {
        draft.x = meterToPx(draft.x, true);
        draft.y = meterToPx(draft.y, true);
        draft.width = meterToPx(draft.width, true);
        draft.height = meterToPx(draft.height, true);

        const isSelected = selectedObjectIds.includes(draft.id);

        draft.zIndex = isSelected
          ? selectedObjectIds.indexOf(draft.id) + 1
          : undefined;
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
