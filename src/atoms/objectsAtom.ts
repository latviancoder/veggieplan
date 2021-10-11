import produce from 'immer';
import { atom } from 'jotai';
import sortBy from 'lodash.sortby';
import { GardenObject } from '../types';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';
import { utilsAtom } from './utilsAtom';

export const _objectsAtom = atom<GardenObject[]>([]);

export const objectsAtom = atom<
  GardenObject[],
  { objects: GardenObject[]; type?: 'pixels' | 'meters' }
>(
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
  (get, set, { objects, type = 'pixels' }) => {
    const { pxToMeter } = get(utilsAtom);

    /*
    Internally and in the database object dimensions are using meters, 
    but when working in the app it's convinient to have pixels.

    When saving objects to the store we convert dimensions to meters and we ignore current zoom value.

    This behaviour is skipped when the values passed are already in meters.
    For example this could happen when store is initially hydrated with objects from the DB.
    */
    if (type === 'pixels') {
      set(
        _objectsAtom,
        objects.map((obj) =>
          produce(obj, (draft) => {
            draft.x = pxToMeter(draft.x, true);
            draft.y = pxToMeter(draft.y, true);
            draft.width = pxToMeter(draft.width, true);
            draft.height = pxToMeter(draft.height, true);
          })
        )
      );
    } else {
      set(_objectsAtom, objects);
    }
  }
);
