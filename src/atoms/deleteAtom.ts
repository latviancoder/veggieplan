import { atom } from 'jotai';
import { objectsAtom } from './objectsAtom';
import { selectionAtom } from './selectionAtom';

// Delete selected objects and reset selection
export const deleteAtom = atom(null, (get, set) => {
  const selection = get(selectionAtom);
  const objects = get(objectsAtom);

  set(
    objectsAtom,
    objects.filter(({ id }) => !selection.includes(id))
  );

  set(selectionAtom, { type: 'reset' });
});
