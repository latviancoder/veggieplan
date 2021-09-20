import { SnapLine } from './../types';
import { SNAPPING_THRESHOLD } from './../constants';
import { rotatePoint, rotateRectangle, isRectangular } from './../utils';
import { atom } from 'jotai';
import {
  Modes,
  ObjectTypes,
  Point,
  RectangleCorners,
  ShapeTypes,
} from '../types';
import { canvasAtom, creatableAtom, modeAtom, offsetAtom } from './atoms';
import { panStartAtom } from './panStartAtom';
import { zoomAtom } from './zoomAtom';
import produce from 'immer';
import { radiansToDegrees } from '../utils';
import { selectionAtom } from './selectionAtom';
import { objectsAtom } from './objectsAtom';
import { snapLinesAtom } from './snapLines';
import { utilsAtom } from './utilsAtom';

type Params = {
  deltaX: number;
  deltaY: number;
  center: Point;
  direction: number;
};

export const panAtom = atom(
  null,
  (get, set, { deltaX, deltaY, center }: Params) => {
    const { relativeToAbsoluteX, relativeToAbsoluteY } = get(utilsAtom);

    const zoom = get(zoomAtom);
    const panStart = get(panStartAtom);
    const mode = get(modeAtom);
    const creatable = get(creatableAtom);
    const objects = get(objectsAtom);
    const selection = get(selectionAtom);

    if (!panStart) {
      return;
    }

    if (mode === Modes.CREATION && creatable) {
      if (isRectangular(creatable)) {
        let creatableAfterDelta = {
          ...creatable,
          x: panStart.click.x + Math.min(deltaX / zoom, 0),
          y: panStart.click.y + Math.min(deltaY / zoom, 0),
          width: Math.abs(deltaX / zoom),
          height: Math.abs(deltaY / zoom),
        };

        set(snapLinesAtom, {
          selectedObjects: [creatableAfterDelta],
          snapPoints: panStart.snapPoints,
          noMiddle: true,
        });

        const snapLines = get(snapLinesAtom);

        if (snapLines.length) {
          const h = snapLines.find(
            ({ direction }) => direction === 'horizontal'
          );
          const v = snapLines.find(({ direction }) => direction === 'vertical');

          if (v) {
            creatableAfterDelta = produce(creatableAfterDelta, (draft) => {
              if (
                Math.abs(v.pointFrom.y - creatableAfterDelta.y) >=
                Math.abs(
                  v.pointFrom.y -
                    (creatableAfterDelta.y + creatableAfterDelta.height)
                )
              ) {
                draft.height = draft.height + v.distance;
              } else {
                draft.y = draft.y + v.distance;
                draft.height = draft.height - v.distance;
              }
            });
          }

          if (h) {
            creatableAfterDelta = produce(creatableAfterDelta, (draft) => {
              if (
                Math.abs(h.pointFrom.x - creatableAfterDelta.x) >=
                Math.abs(
                  h.pointFrom.x -
                    (creatableAfterDelta.x + creatableAfterDelta.width)
                )
              ) {
                draft.width = draft.width + h.distance;
              } else {
                draft.x = draft.x + h.distance;
                draft.width = draft.width - h.distance;
              }
            });
          }
        }

        set(creatableAtom, creatableAfterDelta);
      }
    }

    if (mode === Modes.MOVEMENT) {
      const objectsAfterDelta = produce(objects, (draft) => {
        panStart.selection?.forEach((selectedObject) => {
          const i = objects.findIndex(({ id }) => selectedObject.id === id);

          draft[i].x = selectedObject.x + deltaX / zoom;
          draft[i].y = selectedObject.y + deltaY / zoom;
        });
      });

      const selectedObjects = objectsAfterDelta.filter(({ id }) =>
        selection.includes(id)
      );

      set(snapLinesAtom, {
        selectedObjects,
        snapPoints: panStart.snapPoints,
      });
      const snapLines = get(snapLinesAtom);

      let snappedObjects;

      if (snapLines.length) {
        snappedObjects = produce(objectsAfterDelta, (draft) => {
          panStart.selection?.forEach((selectedObject) => {
            const i = objects.findIndex(({ id }) => selectedObject.id === id);

            const h = snapLines.find(
              ({ direction }) => direction === 'horizontal'
            );
            const v = snapLines.find(
              ({ direction }) => direction === 'vertical'
            );

            if (isRectangular(selectedObject)) {
              if (v) {
                draft[i].y = draft[i].y + v.distance;
              }
              if (h) {
                draft[i].x = draft[i].x + h.distance;
              }
            }
          });
        });
      }

      set(objectsAtom, snappedObjects || objectsAfterDelta);
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
      if (!isRectangular(obj)) return;

      const objectsAfterResize = produce(objects, (draft) => {
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
      });

      // todo eventually enable snapping for resizing rotated rectangles, right now too dumb
      if (!obj.rotation) {
        set(snapLinesAtom, {
          selectedObjects: [objectsAfterResize[i]],
          snapPoints: panStart.snapPoints,
          noMiddle: true,
        });
      }

      const snapLines = get(snapLinesAtom);

      let snappedObjects;

      if (snapLines.length) {
        snappedObjects = produce(objectsAfterResize, (draft) => {
          panStart.selection?.forEach((selectedObject) => {
            const h = snapLines.find(
              ({ direction }) => direction === 'horizontal'
            );
            const v = snapLines.find(
              ({ direction }) => direction === 'vertical'
            );

            if (selectedObject) {
              if (v) {
                // draft[i].y = draft[i].y + v.distance;
                draft[i].height = draft[i].height + v.distance;
              }
              if (h) {
                // draft[i].x = draft[i].x + h.distance;
                draft[i].width = draft[i].width + h.distance;
              }
            }
          });
        });
      }

      set(objectsAtom, snappedObjects || objectsAfterResize);
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
        x: relativeToAbsoluteX(obj.x) + (obj.width * zoom) / 2,
        y: relativeToAbsoluteY(obj.y) + (obj.height * zoom) / 2,
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
