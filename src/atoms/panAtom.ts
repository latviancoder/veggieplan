import { SnapLine } from './../types';
import { SNAPPING_THRESHOLD } from './../constants';
import { rotatePoint, rotateRectangle, isRectangle } from './../utils';
import { atom } from 'jotai';
import {
  Modes,
  ObjectTypes,
  Point,
  RectangleCorners,
  ShapeTypes,
} from '../types';
import {
  canvasAtom,
  creatableAtom,
  modeAtom,
  offsetAtom,
  snapLinesAtom,
} from './atoms';
import { panStartAtom } from './panStartAtom';
import { zoomAtom } from './zoomAtom';
import produce from 'immer';
import { radiansToDegrees } from '../utils';
import { selectionAtom } from './selectionAtom';
import { objectsAtom } from './objectsAtom';

type Params = {
  deltaX: number;
  deltaY: number;
  center: Point;
  direction: number;
};

export const panAtom = atom(
  null,
  (get, set, { deltaX, deltaY, center, direction }: Params) => {
    const zoom = get(zoomAtom);
    const canvas = get(canvasAtom);
    const offset = get(offsetAtom);
    const panStart = get(panStartAtom);
    const mode = get(modeAtom);
    const creatable = get(creatableAtom);
    const objects = get(objectsAtom);
    const selection = get(selectionAtom);

    if (!panStart) {
      return;
    }

    if (mode === Modes.MOVEMENT) {
      const objectsAfterMove = produce(objects, (draft) => {
        panStart.selection?.forEach((selectedObject) => {
          const i = objects.findIndex(({ id }) => selectedObject.id === id);

          draft[i].x = selectedObject.x + deltaX / zoom;
          draft[i].y = selectedObject.y + deltaY / zoom;
        });
      });

      const selectedObjects = objectsAfterMove.filter(({ id }) =>
        selection.includes(id)
      );

      let selectedObjectsCorners: Point[] = [];

      selectedObjects.forEach((obj) => {
        if (isRectangle(obj)) {
          const { TopLeft, BottomLeft, TopRight, BottomRight } =
            rotateRectangle({ rectangle: obj });

          selectedObjectsCorners = [
            ...selectedObjectsCorners,
            TopLeft,
            BottomLeft,
            TopRight,
            BottomRight,
          ];
        }
      });

      const topLeft = {
        x: Math.min(...selectedObjectsCorners.map(({ x }) => x)),
        y: Math.min(...selectedObjectsCorners.map(({ y }) => y)),
      };

      const bottomRight = {
        x: Math.max(...selectedObjectsCorners.map(({ x }) => x)),
        y: Math.max(...selectedObjectsCorners.map(({ y }) => y)),
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
        {
          x: (topLeft.x + bottomRight.x) / 2,
          y: (topLeft.y + bottomRight.y) / 2,
        },
      ];

      let snapLines: SnapLine[] = [];

      panStart.snapPoints?.forEach((snapPoint) => {
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

      // Leave only snaplines with the smallest distance between them and object
      // snapLines = snapLines.filter(
      //   ({ distance }) =>
      //     Math.abs(distance) ===
      //     Math.min(...snapLines.map(({ distance }) => Math.abs(distance)))
      // );

      let snappedObjects;

      if (!!snapLines.length) {
        snappedObjects = produce(objectsAfterMove, (draft) => {
          panStart.selection?.forEach((selectedObject) => {
            const i = objects.findIndex(({ id }) => selectedObject.id === id);

            const h = snapLines.find(
              ({ direction }) => direction === 'horizontal'
            );
            const v = snapLines.find(
              ({ direction }) => direction === 'vertical'
            );

            if (v) {
              draft[i].y = draft[i].y + v.distance;
            }
            if (h) {
              draft[i].x = draft[i].x + h.distance;
            }
          });
        });
      }

      set(snapLinesAtom, snapLines);
      set(objectsAtom, snappedObjects || objectsAfterMove);
    }

    if (mode === Modes.CREATION) {
      let x = panStart.click.x + Math.min(deltaX / zoom, 0);
      let y = panStart.click.y + Math.min(deltaY / zoom, 0);

      let width = Math.abs(deltaX / zoom);
      let height = Math.abs(deltaY / zoom);

      if (creatable?.objectType === ObjectTypes.Shape) {
        set(creatableAtom, {
          ...creatable,
          x,
          y,
          width,
          height,
        });
      }
    }

    if (mode === Modes.RESIZING && panStart.resizingHandler) {
      const resizingHandler = panStart.resizingHandler;

      const obj = panStart.selection?.find(
        ({ id }) => panStart.interactableObjectId === id
      )!;
      const i = objects.findIndex(
        ({ id }) => panStart.interactableObjectId === id
      )!;

      // todo circle
      if (!isRectangle(obj)) return;

      set(
        objectsAtom,
        produce(objects, (draft) => {
          // Resizing while considering element rotation
          // https://shihn.ca/posts/2020/resizing-rotated-elements/

          // Step 1
          // Rotate every rectangle corner around origin (center of rectangle)
          const rotatedCorners = rotateRectangle({
            rectangle: obj,
          });

          // Step 2
          // Add delta to currently dragged corner, this is current mouse position
          rotatedCorners[resizingHandler].x += deltaX / zoom;
          rotatedCorners[resizingHandler].y += deltaY / zoom;

          // Step 3
          // Calculate new center using diagonal corners
          // Depending on dragged resizing handler we need different diagonal
          const newRotationOrigin = [
            RectangleCorners.TopRight,
            RectangleCorners.BottomLeft,
          ].includes(resizingHandler)
            ? {
                x:
                  (rotatedCorners[RectangleCorners.BottomLeft].x +
                    rotatedCorners[RectangleCorners.TopRight].x) /
                  2,
                y:
                  (rotatedCorners[RectangleCorners.BottomLeft].y +
                    rotatedCorners[RectangleCorners.TopRight].y) /
                  2,
              }
            : {
                x:
                  (rotatedCorners[RectangleCorners.TopLeft].x +
                    rotatedCorners[RectangleCorners.BottomRight].x) /
                  2,
                y:
                  (rotatedCorners[RectangleCorners.TopLeft].y +
                    rotatedCorners[RectangleCorners.BottomRight].y) /
                  2,
              };

          // Step 4
          // Rotate every corner back to normal, but around new origin
          const revertedRotatedCorners = {
            [RectangleCorners.TopLeft]: rotatePoint({
              point: rotatedCorners[RectangleCorners.TopLeft],
              rotationOrigin: newRotationOrigin,
              rotation: -obj.rotation,
            }),
            [RectangleCorners.BottomLeft]: rotatePoint({
              point: rotatedCorners[RectangleCorners.BottomLeft],
              rotationOrigin: newRotationOrigin,
              rotation: -obj.rotation,
            }),
            [RectangleCorners.BottomRight]: rotatePoint({
              point: rotatedCorners[RectangleCorners.BottomRight],
              rotationOrigin: newRotationOrigin,
              rotation: -obj.rotation,
            }),
            [RectangleCorners.TopRight]: rotatePoint({
              point: rotatedCorners[RectangleCorners.TopRight],
              rotationOrigin: newRotationOrigin,
              rotation: -obj.rotation,
            }),
          };

          // Step 5
          // Calculate new topleft corner and width/height
          if (
            [RectangleCorners.TopRight, RectangleCorners.BottomLeft].includes(
              resizingHandler
            )
          ) {
            draft[i].x = revertedRotatedCorners[RectangleCorners.BottomLeft].x;
            draft[i].y = revertedRotatedCorners[RectangleCorners.TopRight].y;
            draft[i].width =
              revertedRotatedCorners[RectangleCorners.TopRight].x -
              revertedRotatedCorners[RectangleCorners.BottomLeft].x;
            draft[i].height =
              revertedRotatedCorners[RectangleCorners.BottomLeft].y -
              revertedRotatedCorners[RectangleCorners.TopRight].y;
          } else {
            draft[i].x = revertedRotatedCorners[RectangleCorners.TopLeft].x;
            draft[i].y = revertedRotatedCorners[RectangleCorners.TopLeft].y;
            draft[i].width =
              revertedRotatedCorners[RectangleCorners.BottomRight].x -
              revertedRotatedCorners[RectangleCorners.TopLeft].x;
            draft[i].height =
              revertedRotatedCorners[RectangleCorners.BottomRight].y -
              revertedRotatedCorners[RectangleCorners.TopLeft].y;
          }
        })
      );
    }

    if (mode === Modes.ROTATION) {
      const obj = panStart.selection?.find(
        ({ id }) => panStart.interactableObjectId === id
      )!;
      const i = objects.findIndex(
        ({ id }) => panStart.interactableObjectId === id
      )!;

      // We are using Math.atan2 to calculate angle between origin and [x,y].
      // atan2 assumes origin is at [0,0], but our origin is in the middle of shape
      // We need to subtract the coordinates of your origin from the [x,y]
      // https://stackoverflow.com/questions/17372332/specify-origin-of-math-atan2
      // For that we also need to convert relative zoomed values to absolute screen values
      const origin = {
        x: canvas.x - offset.x * zoom + obj.x * zoom + (obj.width * zoom) / 2,
        y: canvas.y - offset.y * zoom + obj.y * zoom + (obj.height * zoom) / 2,
      };

      const rota = radiansToDegrees(
        Math.atan2(center.y - origin.y, center.x - origin.x)
      );

      set(
        objectsAtom,
        produce(objects, (draft) => {
          // No idea why +90 degree is necessary :shrug:
          draft[i].rotation = rota + 90;
        })
      );
    }

    if (mode === Modes.DEFAULT) {
      set(offsetAtom, {
        x: panStart.offset.x - deltaX / zoom,
        y: panStart.offset.y - deltaY / zoom,
      });
    }
  }
);
