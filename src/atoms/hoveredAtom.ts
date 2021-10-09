import { atom } from 'jotai';
import { zoomAtom } from './zoomAtom';
import { Modes } from '../types';
import { getObjectAtPoint } from '../utils';
import { modeAtom, mousePositionAtom } from './atoms';
import { objectsAtom } from './objectsAtom';
import { utilsAtom } from './utilsAtom';

export const hoveredAtom = atom<null | string>((get) => {
  const { absoluteToRelativeX, absoluteToRelativeY } = get(utilsAtom);
  const objects = get(objectsAtom);
  const mode = get(modeAtom);
  const mousePosition = get(mousePositionAtom);
  const zoom = get(zoomAtom);

  let hoveredObject;

  if (mode === Modes.DEFAULT && mousePosition) {
    hoveredObject = getObjectAtPoint({
      point: {
        x: absoluteToRelativeX(mousePosition.x),
        y: absoluteToRelativeY(mousePosition.y),
      },
      objects,
      offset: 2 / zoom,
    });
  }

  return hoveredObject?.id ?? null;
});
