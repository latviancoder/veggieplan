import { atom } from 'jotai';
import sortBy from 'lodash.sortby';
import { GardenObject } from '../types';

const _objectsAtom = atom<GardenObject[]>([]);

export const objectsAtom = atom<GardenObject[], GardenObject[]>(
  (get) =>
    sortBy(get(_objectsAtom), ({ zIndex, sorting }) =>
      zIndex ? zIndex : sorting
    ),
  (_, set, action) => set(_objectsAtom, action)
);
