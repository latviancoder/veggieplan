import { atom } from 'jotai';
import produce from 'immer';
import { objectsAtom } from './objectsAtom';

const _selectedObjectIdsAtom = atom<string[]>([]);

export const selectedObjectIdsAtom = atom<
  string[],
  | { type: 'remove' | 'add' | 'reset-add'; objectIds: string[] }
  | { type: 'reset' }
>(
  (get) => get(_selectedObjectIdsAtom),
  (get, set, action) => {
    const objects = get(objectsAtom);

    if (action.type === 'reset') {
      set(_selectedObjectIdsAtom, []);
    }

    if (action.type === 'reset-add') {
      set(_selectedObjectIdsAtom, [...action.objectIds]);
    }

    if (action.type === 'add' && !!action.objectIds.length) {
      set(_selectedObjectIdsAtom, [
        ...get(_selectedObjectIdsAtom),
        ...action.objectIds,
      ]);
    }

    if (action.type === 'remove') {
      set(
        _selectedObjectIdsAtom,
        get(_selectedObjectIdsAtom).filter((id) =>
          action.objectIds.includes(id)
        )
      );
    }

    const selection = get(_selectedObjectIdsAtom);

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
