import { atom } from 'jotai';
import { zoomAtom } from './zoomAtom';
import { Modes } from '../types';
import { isPointInsideRectangle } from '../utils';
import { modeAtom, mousePositionAtom } from './atoms';
import { objectsAtom } from './objectsAtom';
import { utilsAtom } from './utilsAtom';

export const hoveredAtom = atom<null | string>((get) => {
  const { absoluteToRelativeX, absoluteToRelativeY } = get(utilsAtom);
  const objects = get(objectsAtom);
  const mode = get(modeAtom);
  const mousePosition = get(mousePositionAtom);
  const zoom = get(zoomAtom);

  let hoveredObjectId = null;

  if (mode === Modes.DEFAULT && mousePosition) {
    for (let obj of objects) {
      if (
        isPointInsideRectangle({
          point: {
            x: absoluteToRelativeX(mousePosition.x),
            y: absoluteToRelativeY(mousePosition.y),
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
