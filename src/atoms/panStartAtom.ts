import { atom } from 'jotai';
import { nanoid } from 'nanoid';

import { HANDLER_OFFSET, HANDLER_SIZE } from '../constants';
import {
  GardenObject,
  Modes,
  ObjectTypes,
  Point,
  RectangleCorners,
  ShapeTypes,
} from '../types';
import {
  getObjectAtPoint,
  isPointInsideCircle,
  isPointInsideRectangle,
  isRectangular,
  rotateRectangle,
} from '../utils/utils';
import { rectangleHandlerMap } from '../utils/rectangleHandlerMap';
import {
  creatableAtom,
  hiddenObjectIdsAtom,
  modeAtom,
  offsetAtom,
  selectedPlantAtom,
} from './atoms';
import { objectsAtom } from './objectsAtom';
import { selectedObjectIdsAtom } from './selectedObjectIdsAtom';
import { selectionAtom } from './selectionAtom';
import { snapLinesAtom } from './snapLinesAtom';
import { utilsAtom } from './utilsAtom';
import { zoomAtom } from './zoomAtom';

type PanStart = {
  offset: Point;
  click: Point;
  selection?: GardenObject[];
  interactableObjectId?: string;
  resizingHandler?: RectangleCorners;
  snapPoints?: Point[];
} | null;

export const _panStartAtom = atom<PanStart>(null);

export const panStartAtom = atom<PanStart, { center: Point } | null>(
  (get) => get(_panStartAtom),
  (get, set, panStart) => {
    const { absoluteToRelativeX, absoluteToRelativeY } = get(utilsAtom);
    const offset = get(offsetAtom);
    const creatable = get(creatableAtom);
    const objects = get(objectsAtom);
    const mode = get(modeAtom);
    const zoom = get(zoomAtom);
    const selectedObjectIds = get(selectedObjectIdsAtom);
    const selectedPlant = get(selectedPlantAtom);
    const hiddenObjectIds = get(hiddenObjectIdsAtom);

    // Wben panning is starting we want to save starting offset and click position
    if (panStart) {
      const panStartX = absoluteToRelativeX(panStart.center.x);
      const panStartY = absoluteToRelativeY(panStart.center.y);

      set(_panStartAtom, {
        offset: {
          x: offset.x,
          y: offset.y,
        },
        click: {
          x: panStartX,
          y: panStartY,
        },
      });

      if (mode === Modes.SELECTION) {
        set(selectedObjectIdsAtom, { type: 'reset' });

        set(_panStartAtom, {
          ...get(_panStartAtom)!,
          click: {
            x: panStartX,
            y: panStartY,
          },
        });
      } else if (mode === Modes.CREATION) {
        set(selectedObjectIdsAtom, { type: 'reset' });

        const now = new Date();

        let creatable: GardenObject = {
          id: nanoid(),
          x: 0,
          y: 0,
          height: 0,
          width: 0,
          rotation: 0,
          dateAdded: now.toISOString(),
          sorting:
            now.getTime() / Math.pow(10, now.getTime().toString().length),
        } as GardenObject;

        if (selectedPlant) {
          creatable = {
            ...creatable,
            objectType: ObjectTypes.Plant,
            plantId: selectedPlant,
          };

          set(_panStartAtom, {
            ...get(_panStartAtom)!,
            click: {
              x: panStartX,
              y: panStartY,
            },
          });
        } else {
          creatable = {
            ...creatable,
            objectType: ObjectTypes.Shape,
            shapeType: ShapeTypes.Rectangle,
          };
        }

        set(creatableAtom, creatable);
      } else {
        // Check if pan start position is within an object
        let pannedObject = getObjectAtPoint({
          point: {
            x: panStartX,
            y: panStartY,
          },
          objects: objects.filter(({ id }) => !hiddenObjectIds?.includes(id)),
          offset: 2 / zoom,
        });

        if (!pannedObject) return;

        set(modeAtom, Modes.MOVEMENT);

        if (!selectedObjectIds.length) {
          // When nothing selected and panning starts on object we automatically select it
          set(selectedObjectIdsAtom, {
            type: 'add',
            objectIds: [pannedObject.id],
          });
        } else {
          // When something is selected, but panning doesn't start on selected object
          // we deselect everything and select it.
          if (!selectedObjectIds.includes(pannedObject.id)) {
            set(selectedObjectIdsAtom, {
              type: 'reset-add',
              objectIds: [pannedObject.id],
            });
          }
        }

        let resizingHandler: RectangleCorners | undefined = undefined;

        const updatedSelectedObjectIds = get(selectedObjectIdsAtom);

        // Is this one of selected objects?
        if (updatedSelectedObjectIds.find((id) => id === pannedObject?.id)) {
          // Is this resizing handler?
          const handlerMap = rectangleHandlerMap(pannedObject, zoom);

          handlerMap.forEach(({ x, y }, key) => {
            if (
              isPointInsideRectangle({
                point: {
                  x: panStartX,
                  y: panStartY,
                },
                rectangle: {
                  x,
                  y,
                  width: HANDLER_SIZE / zoom,
                  height: HANDLER_SIZE / zoom,
                  rotation: pannedObject!.rotation,
                },
                rotationOrigin: {
                  x: pannedObject!.x + pannedObject!.width / 2,
                  y: pannedObject!.y + pannedObject!.height / 2,
                },
                // Offset because of 1px stroke around object
                offset: 1 / zoom,
              })
            ) {
              // Resizing mode
              set(modeAtom, Modes.RESIZING);
              resizingHandler = key;
            }
          });

          // Is this rotation handler?
          if (
            isPointInsideCircle({
              point: {
                x: panStartX,
                y: panStartY,
              },
              circle: {
                x: pannedObject.x + pannedObject.width / 2,
                y:
                  pannedObject.y +
                  HANDLER_SIZE / zoom / 2 -
                  HANDLER_OFFSET / zoom,
                radius: HANDLER_SIZE / zoom / 2 + 1 / zoom,
              },
              rotation: pannedObject.rotation,
              rotationOrigin: {
                x: pannedObject!.x + pannedObject!.width / 2,
                y: pannedObject!.y + pannedObject!.height / 2,
              },
            })
          ) {
            // Rotation mode
            set(modeAtom, Modes.ROTATION);
          }
        }

        set(_panStartAtom, {
          ...get(_panStartAtom)!,
          // Snapshot selected objects before moving/resizing/rotating starts.
          // This is needed because we need 'initial data' when adding delta values.
          selection: updatedSelectedObjectIds.map(
            (id) => objects.find((obj) => obj.id === id)!
          ),
          resizingHandler,
          interactableObjectId: pannedObject.id,
        });

        // Otherwise it's panning, so we do nothing
      }
    } else {
      // Pan end

      if (creatable?.id) {
        set(objectsAtom, { type: 'append', payload: creatable });
        set(selectedObjectIdsAtom, { type: 'add', objectIds: [creatable.id] });
      }

      set(modeAtom, Modes.DEFAULT);

      set(selectionAtom, null);
      set(_panStartAtom, null);
      set(creatableAtom, null);
      set(selectedPlantAtom, null);

      set(snapLinesAtom, { selectedObjects: [], snapPoints: [] });
    }

    // Calculate corners and middlepoints of every non-selected shape on pan start
    // Needed for effective Figma-style snap-to-other-objects functionality
    if (panStart) {
      const updatedSelectedObjectIds = get(selectedObjectIdsAtom);
      const nonSelected = objects.filter(
        ({ id }) => !updatedSelectedObjectIds.includes(id)
      );

      let snapPoints: Point[] = [];

      nonSelected.forEach((obj) => {
        if (isRectangular(obj)) {
          const { TopLeft, BottomLeft, TopRight, BottomRight, origin } =
            rotateRectangle({ rectangle: obj });

          snapPoints = [
            ...snapPoints,
            TopLeft,
            BottomLeft,
            TopRight,
            BottomRight,
            origin,
          ];
        }
      });

      set(_panStartAtom, {
        ...get(_panStartAtom)!,
        snapPoints,
      });
    }
  }
);
