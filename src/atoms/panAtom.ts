import { atom } from 'jotai';
import { Modes, ObjectTypes, Point, ResizingHandlers } from '../types';
import { canvasAtom, creatableAtom, modeAtom, offsetAtom } from './atoms';
import { panStartAtom } from './panStartAtom';
import { zoomAtom } from './zoomAtom';
import produce from 'immer';
import { radiansToDegrees, rotatePoint } from '../utils';
import { selectionAtom } from './selectionAtom';
import { objectsAtom } from './objectsAtom';

export const panAtom = atom(
  null,
  (
    get,
    set,
    {
      deltaX,
      deltaY,
      center,
    }: { deltaX: number; deltaY: number; center: Point }
  ) => {
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
      set(
        objectsAtom,
        produce(objects, (draft) => {
          panStart.selection?.forEach((selectedObject) => {
            const i = objects.findIndex(({ id }) => selectedObject.id === id);

            draft[i].x = selectedObject.x + deltaX / zoom;
            draft[i].y = selectedObject.y + deltaY / zoom;
          });
        })
      );
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

      const rectangle = panStart.selection?.find(
        ({ id }) => panStart.interactableObjectId === id
      )!;
      const i = objects.findIndex(
        ({ id }) => panStart.interactableObjectId === id
      )!;

      set(
        objectsAtom,
        produce(objects, (draft) => {
          // Resizing while considering element rotation
          // https://shihn.ca/posts/2020/resizing-rotated-elements/

          // Step 1
          // Rotate every rectangle corner around origin (center of rectangle)
          const rotationOrigin = {
            x: rectangle.x + rectangle.width / 2,
            y: rectangle.y + rectangle.height / 2,
          };

          const rotatedTopLeft = rotatePoint({
            point: { x: rectangle.x, y: rectangle.y },
            rotationOrigin,
            rotation: rectangle.rotation,
          });

          const rotatedBottomLeft = rotatePoint({
            point: { x: rectangle.x, y: rectangle.y + rectangle.height },
            rotationOrigin,
            rotation: rectangle.rotation,
          });

          const rotatedBottomRight = rotatePoint({
            point: {
              x: rectangle.x + rectangle.width,
              y: rectangle.y + rectangle.height,
            },
            rotationOrigin,
            rotation: rectangle.rotation,
          });

          const rotatedTopRight = rotatePoint({
            point: {
              x: rectangle.x + rectangle.width,
              y: rectangle.y,
            },
            rotationOrigin,
            rotation: rectangle.rotation,
          });

          // Step 2
          // Add delta to currently dragged corner, this is current mouse position
          if (resizingHandler === ResizingHandlers.TopLeft) {
            rotatedTopLeft.x += deltaX / zoom;
            rotatedTopLeft.y += deltaY / zoom;
          }

          if (resizingHandler === ResizingHandlers.TopRight) {
            rotatedTopRight.x += deltaX / zoom;
            rotatedTopRight.y += deltaY / zoom;
          }

          if (resizingHandler === ResizingHandlers.BottomRight) {
            rotatedBottomRight.x += deltaX / zoom;
            rotatedBottomRight.y += deltaY / zoom;
          }

          if (resizingHandler === ResizingHandlers.BottomLeft) {
            rotatedBottomLeft.x += deltaX / zoom;
            rotatedBottomLeft.y += deltaY / zoom;
          }

          // Step 3
          // Calculate new center using diagonal corners
          // Depending on dragged resizing handler we need different diagonal
          const newRotationOrigin = [
            ResizingHandlers.TopRight,
            ResizingHandlers.BottomLeft,
          ].includes(resizingHandler)
            ? {
                x: (rotatedBottomLeft.x + rotatedTopRight.x) / 2,
                y: (rotatedBottomLeft.y + rotatedTopRight.y) / 2,
              }
            : {
                x: (rotatedTopLeft.x + rotatedBottomRight.x) / 2,
                y: (rotatedTopLeft.y + rotatedBottomRight.y) / 2,
              };

          // Step 4
          // Rotate every corner back to normal, but around new origin
          const newBottomLeft = rotatePoint({
            point: rotatedBottomLeft,
            rotationOrigin: {
              x: newRotationOrigin.x,
              y: newRotationOrigin.y,
            },
            rotation: -rectangle.rotation,
          });

          const newTopRight = rotatePoint({
            point: rotatedTopRight,
            rotationOrigin: {
              x: newRotationOrigin.x,
              y: newRotationOrigin.y,
            },
            rotation: -rectangle.rotation,
          });

          const newTopLeft = rotatePoint({
            point: rotatedTopLeft,
            rotationOrigin: {
              x: newRotationOrigin.x,
              y: newRotationOrigin.y,
            },
            rotation: -rectangle.rotation,
          });

          const newBottomRight = rotatePoint({
            point: rotatedBottomRight,
            rotationOrigin: {
              x: newRotationOrigin.x,
              y: newRotationOrigin.y,
            },
            rotation: -rectangle.rotation,
          });

          // Step 5
          // Calculate new topleft corner and width/height
          if (
            [ResizingHandlers.TopRight, ResizingHandlers.BottomLeft].includes(
              resizingHandler
            )
          ) {
            draft[i].x = newBottomLeft.x;
            draft[i].y = newTopRight.y;
            draft[i].width = newTopRight.x - newBottomLeft.x;
            draft[i].height = newBottomLeft.y - newTopRight.y;
          } else {
            draft[i].x = newTopLeft.x;
            draft[i].y = newTopLeft.y;
            draft[i].width = newBottomRight.x - newTopLeft.x;
            draft[i].height = newBottomRight.y - newTopLeft.y;
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
