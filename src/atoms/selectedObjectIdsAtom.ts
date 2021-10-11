import { atom } from 'jotai';

const _selectedObjectIdsAtom = atom<string[]>([]);

export const selectedObjectIdsAtom = atom<
  string[],
  | { type: 'remove' | 'add' | 'reset-add'; objectIds: string[] }
  | { type: 'reset' }
>(
  (get) => get(_selectedObjectIdsAtom),
  (get, set, action) => {
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
  }
);
