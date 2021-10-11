import { atom } from 'jotai';
import { objectsAtom } from './objectsAtom';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';

// Delete selected objects and reset selection
export const deleteAtom = atom(null, (get, set) => {
  const selectedObjectIds = get(selectedObjectIdsAtom);
  const objects = get(objectsAtom);

  set(objectsAtom, {
    objects: objects.filter(({ id }) => !selectedObjectIds.includes(id)),
  });

  set(selectedObjectIdsAtom, { type: 'reset' });
});
