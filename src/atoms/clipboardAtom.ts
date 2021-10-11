import { zoomAtom } from './zoomAtom';
import { objectsAtom } from './objectsAtom';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';
import { GardenObject } from './../types';
import { atom } from 'jotai';
import { nanoid } from 'nanoid';

const _clipboardAtom = atom<GardenObject[]>([]);

export const copyAtom = atom(null, (get, set) => {
  const selectedObjectIds = get(selectedObjectIdsAtom);
  const objects = get(objectsAtom);

  // Save snapshot of currently selected objects
  set(
    _clipboardAtom,
    selectedObjectIds.map((id) => objects.find((obj) => obj.id === id)!)
  );
});

export const pasteAtom = atom(null, (get, set) => {
  const clipboard = get(_clipboardAtom);
  const objects = get(objectsAtom);
  const zoom = get(zoomAtom);

  const offset = window.outerWidth / zoom / 100;

  const newObjects = clipboard.map((copiedObject) => {
    return {
      ...copiedObject,
      // Generate new IDs for copied objects
      id: nanoid(),
      // Shift every copied object slightly to the right/bottom of where it was
      x: copiedObject.x + offset,
      y: copiedObject.y + offset,
    };
  });

  set(objectsAtom, { objects: [...objects, ...newObjects] });

  set(selectedObjectIdsAtom, {
    type: 'reset-add',
    objectIds: newObjects.map(({ id }) => id),
  });
});
