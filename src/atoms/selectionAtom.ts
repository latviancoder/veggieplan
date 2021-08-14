import { atom } from 'jotai';
import { GardenObject } from '../types';
import produce, { current } from 'immer';
import { objectsAtom } from './objectsAtom';

const _selectionAtom = atom<string[]>([]);

export const selectionAtom = atom<
  string[],
  | { type: 'remove' | 'add' | 'reset-add'; objectIds: string[] }
  | { type: 'reset' }
>(
  (get) => get(_selectionAtom),
  (get, set, action) => {
    const objects = get(objectsAtom);

    if (action.type === 'reset') {
      set(_selectionAtom, []);
    }

    if (action.type === 'reset-add') {
      set(_selectionAtom, [...action.objectIds]);
    }

    if (action.type === 'add' && !!action.objectIds.length) {
      set(_selectionAtom, [...get(_selectionAtom), ...action.objectIds]);
    }

    if (action.type === 'remove') {
      set(
        _selectionAtom,
        get(_selectionAtom).filter((id) => action.objectIds.includes(id))
      );
    }

    const selection = get(_selectionAtom);

    // Selected objects
    set(
      objectsAtom,
      produce(objects, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          const obj = draft[i];

          const isSelected = selection.includes(obj.id);

          obj.zIndex = isSelected ? selection.indexOf(obj.id) + 1 : undefined;
        }
      })
    );
  }
);
