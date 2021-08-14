import { atom } from 'jotai';
import { zoomAtom } from './zoomAtom';
import { Modes } from '../types';
import { isPointInsideRectangle } from '../utils';
import { modeAtom, mousePositionAtom, offsetAtom } from './atoms';
import { objectsAtom } from './objectsAtom';

export const hoveredAtom = atom<null | string>((get) => {
  const objects = get(objectsAtom);
  const mode = get(modeAtom);
  const mousePosition = get(mousePositionAtom);
  const zoom = get(zoomAtom);
  const offset = get(offsetAtom);

  let hoveredObjectId = null;

  if (mode === Modes.DEFAULT) {
    for (let obj of objects) {
      if (
        isPointInsideRectangle({
          point: {
            x: mousePosition.x / zoom + offset.x,
            y: mousePosition.y / zoom + offset.y,
          },
          rectangle: obj,
          offset: 2 / zoom,
        })
      ) {
        hoveredObjectId = obj.id;
      }
    }
  }

  return hoveredObjectId;
});
