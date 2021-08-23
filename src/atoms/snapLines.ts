import { zoomAtom } from './zoomAtom';
import { atom } from 'jotai';
import { GardenObject, Point, SnapLine } from '../types';
import { isRectangle, rotateRectangle } from '../utils';
import { SNAPPING_THRESHOLD } from '../constants';

const _snapLinesAtom = atom<SnapLine[]>([]);

export const snapLinesAtom = atom(
  (get) => get(_snapLinesAtom),
  (
    get,
    set,
    {
      selectedObjects,
      snapPoints,
      noMiddle,
    }: {
      selectedObjects: GardenObject[];
      snapPoints?: Point[];
      noMiddle?: boolean;
    }
  ) => {
    const zoom = get(zoomAtom);

    let corners: Point[] = [];

    selectedObjects.forEach((obj) => {
      if (isRectangle(obj)) {
        const { TopLeft, BottomLeft, TopRight, BottomRight } = rotateRectangle({
          rectangle: obj,
        });

        corners = [...corners, TopLeft, BottomLeft, TopRight, BottomRight];
      }
    });

    const topLeft = {
      x: Math.min(...corners.map(({ x }) => x)),
      y: Math.min(...corners.map(({ y }) => y)),
    };

    const bottomRight = {
      x: Math.max(...corners.map(({ x }) => x)),
      y: Math.max(...corners.map(({ y }) => y)),
    };

    const selectionSnapPoints = [
      topLeft,
      bottomRight,
      {
        x: bottomRight.x,
        y: topLeft.y,
      },
      {
        x: topLeft.x,
        y: bottomRight.y,
      },
    ];

    // todo remove this when I can think of proper algorithm for snapping in the middle
    if (!noMiddle) {
      selectionSnapPoints.push({
        x: (topLeft.x + bottomRight.x) / 2,
        y: (topLeft.y + bottomRight.y) / 2,
      });
    }

    let snapLines: SnapLine[] = [];

    snapPoints?.forEach((snapPoint) => {
      selectionSnapPoints.forEach((selectionSnapPoint) => {
        if (
          Math.abs(snapPoint.y - selectionSnapPoint.y) <=
          SNAPPING_THRESHOLD / zoom
        ) {
          snapLines.push({
            pointFrom: snapPoint,
            pointTo: {
              x: selectionSnapPoint.x,
              y: snapPoint.y,
            },
            distance: snapPoint.y - selectionSnapPoint.y,
            direction: 'vertical',
          });
        }
        if (
          Math.abs(snapPoint.x - selectionSnapPoint.x) <=
          SNAPPING_THRESHOLD / zoom
        ) {
          snapLines.push({
            pointFrom: snapPoint,
            pointTo: {
              x: snapPoint.x,
              y: selectionSnapPoint.y,
            },
            distance: snapPoint.x - selectionSnapPoint.x,
            direction: 'horizontal',
          });
        }
      });
    });

    set(_snapLinesAtom, snapLines);
  }
);
