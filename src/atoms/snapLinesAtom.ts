import { atom } from 'jotai';
import { uniq } from 'lodash';

import { GardenObject, Point, SnapLine } from 'types';

import { SNAPPING_THRESHOLD } from '../constants';
import { isRectangular, rotateRectangle } from '../utils/utils';
import { zoomAtom } from './zoomAtom';

const _snapLinesAtom = atom<SnapLine[]>([]);

const closest = (numbers: number[], goal: number) =>
  numbers.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });

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
      if (isRectangular(obj)) {
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

    if (snapPoints?.length) {
      const snapPointsX = uniq(snapPoints?.map(({ x }) => x));
      const selectionSnapPointsX = uniq(selectionSnapPoints.map(({ x }) => x));

      const closestSnapPointsX = selectionSnapPointsX
        .map((selectionX) => {
          // For each selection snap point find snap point closest to it
          const closestX = closest(snapPointsX, selectionX);

          // And only filter those out which are below threshold
          if (Math.abs(closestX - selectionX) <= SNAPPING_THRESHOLD / zoom) {
            return {
              snapX: closestX,
              selectionX,
            };
          }

          return undefined;
        })
        .filter((n) => n);

      closestSnapPointsX?.forEach(({ snapX, selectionX }: any) => {
        snapLines.push({
          point: { x: snapX, y: 0 },
          selection: selectionX,
          distance: snapX - selectionX,
          direction: 'horizontal',
        });
      });

      const snapPointsY = uniq(snapPoints?.map(({ y }) => y));
      const selectionSnapPointsY = uniq(selectionSnapPoints.map(({ y }) => y));

      const closestSnapPointsY = selectionSnapPointsY
        .map((selectionY) => {
          // For each selection snap point find snap point closest to it
          const closestY = closest(snapPointsY, selectionY);

          // And only filter those out which are below threshold
          if (Math.abs(closestY - selectionY) <= SNAPPING_THRESHOLD / zoom) {
            return {
              snapY: closestY,
              selectionY,
            };
          }

          return undefined;
        })
        .filter((n) => n);

      closestSnapPointsY?.forEach(({ snapY, selectionY }: any) => {
        snapLines.push({
          point: { x: 0, y: snapY },
          selection: selectionY,
          distance: snapY - selectionY,
          direction: 'vertical',
        });
      });
    }

    set(_snapLinesAtom, snapLines);
  }
);
