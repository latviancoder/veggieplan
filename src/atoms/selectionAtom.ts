import { atom } from 'jotai';

import {
  convertRectangleToPolygon,
  doPolygonsIntersect,
  isRectangular,
} from '../utils/utils';
import { objectsAtom } from './objectsAtom';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';

type Selection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const _selectionAtom = atom<Selection | null>(null);

export const selectionAtom = atom<Selection | null, Selection | null>(
  (get) => {
    return get(_selectionAtom);
  },
  (get, set, selection) => {
    const objects = get(objectsAtom);

    if (selection) {
      const selectionPolygon = convertRectangleToPolygon({
        rectangle: { ...selection, rotation: 0 },
      });

      let selectedObjectIds: string[] = [];

      objects.forEach((obj) => {
        if (isRectangular(obj)) {
          const rectanglePolygon = convertRectangleToPolygon({
            rectangle: obj,
          });

          if (doPolygonsIntersect(selectionPolygon, rectanglePolygon)) {
            selectedObjectIds.push(obj.id);
          }
        }
      });

      set(selectedObjectIdsAtom, {
        type: 'reset-add',
        objectIds: selectedObjectIds,
      });
    }

    set(_selectionAtom, selection);
  }
);
