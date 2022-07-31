import { atom } from 'jotai';
import { zoomAtom } from './zoomAtom';
import { Modes } from '../types';
import { getObjectAtPoint } from '../utils/utils';
import { modeAtom, mousePositionAtom, hiddenObjectIdsAtom } from './atoms';
import { objectsAtom } from './objectsAtom';
import { utilsAtom } from './utilsAtom';

export const hoveredAtom = atom<null | string>((get) => {
  const { absoluteToRelativeX, absoluteToRelativeY } = get(utilsAtom);
  const objects = get(objectsAtom);
  const mode = get(modeAtom);
  const mousePosition = get(mousePositionAtom);
  const zoom = get(zoomAtom);
  const hiddenObjectIds = get(hiddenObjectIdsAtom);

  let hoveredObject;

  if (mode === Modes.DEFAULT && mousePosition) {
    hoveredObject = getObjectAtPoint({
      point: {
        x: absoluteToRelativeX(mousePosition.x),
        y: absoluteToRelativeY(mousePosition.y),
      },
      objects: objects.filter(({ id }) => !hiddenObjectIds?.includes(id)),
      offset: 2 / zoom,
    });
  }

  return hoveredObject?.id ?? null;
});
