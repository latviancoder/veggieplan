import { areIntervalsOverlapping, format, max, min } from 'date-fns';
import { de } from 'date-fns/locale';
import produce from 'immer';
import { useAtomValue } from 'jotai/utils';
import { compact, isEmpty } from 'lodash';

import {
  canvasAtom,
  offsetAtom,
  plantsAtom,
  configAtom,
  plotCanvasAtom,
  zoomAtom,
} from 'atoms';
import {
  GardenObject,
  ObjectTypes,
  Plant,
  Point,
  RectangleCorners,
  RectangleShape,
  Shape,
  ShapeTypes,
} from 'types';

export const roundTwoDecimals = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const useUtils = () => {
  const zoom = useAtomValue(zoomAtom);
  const plot = useAtomValue(configAtom);
  const plotCanvas = useAtomValue(plotCanvasAtom);
  const canvas = useAtomValue(canvasAtom);
  const offset = useAtomValue(offsetAtom);
  const plants = useAtomValue(plantsAtom);

  const pxToMeter = (px: number = 0, noZoom = false): number => {
    const meterInPx = plotCanvas.width / plot.width;
    return roundTwoDecimals(px / meterInPx / (noZoom ? 1 : zoom));
  };

  const meterToPx = (meters: number = 0, noZoom = false): number => {
    return roundTwoDecimals(
      ((meters * plotCanvas.width) / plot.width) * (noZoom ? 1 : zoom)
    );
  };

  const meterToPxObject = <T extends GardenObject>(
    obj: T,
    noZoom = false
  ): T => {
    return produce(obj, (draft) => {
      draft.x = meterToPx(draft.x, noZoom);
      draft.y = meterToPx(draft.y, noZoom);
      draft.width = meterToPx(draft.width, noZoom);
      draft.height = meterToPx(draft.height, noZoom);
    });
  };

  const pxToMeterObject = <T extends GardenObject>(
    obj: T,
    noZoom = false
  ): T => {
    return produce(obj, (draft) => {
      draft.x = pxToMeter(draft.x, noZoom);
      draft.y = pxToMeter(draft.y, noZoom);
      draft.width = pxToMeter(draft.width, noZoom);
      draft.height = pxToMeter(draft.height, noZoom);
    });
  };

  const getPlantDetails = (obj: Plant) => {
    const plantDetails = plants.find(({ id }) => id === obj.plantId);

    if (!plantDetails) {
      throw new Error(`Couldn't find plant with ID ${obj.plantId}`);
    }

    // Plant object can override certain plant params like spacing
    return produce(plantDetails, (draft) => {
      if (obj.inRowSpacing) {
        draft.inRowSpacing = obj.inRowSpacing;
      }

      if (obj.rowSpacing) {
        draft.rowSpacing = obj.rowSpacing;
      }
    });
  };

  return {
    pxToMeter,
    pxToMeterObject,
    meterToPx,
    meterToPxObject,
    absoluteToRelativeX: (x: number) => {
      return (x - canvas.x) / zoom + offset.x;
    },
    absoluteToRelativeY: (y: number) => {
      return (y - canvas.y) / zoom + offset.y;
    },
    getPlantDetails,
    getPlantAmount: (obj: Plant) => {
      const { width, height } = obj; // in meters
      const { inRowSpacing, rowSpacing } = getPlantDetails(obj);

      const smallestSide = Math.min(height, width);
      const largestSide = Math.max(height, width);

      const rows = Math.round(smallestSide / (rowSpacing / 100));
      const inRow = Math.round(largestSide / (inRowSpacing / 100));

      return { rows: Math.max(rows, 1), inRow: Math.max(inRow, 1) };
    },
  };
};

export const rotateRectangle = ({
  rectangle: { x, y, width, height, rotation },
  rotationOrigin = { x: x + width / 2, y: y + height / 2 },
}: {
  rectangle: RectangleShape | Plant;
  rotationOrigin?: Point;
}) => {
  return {
    [RectangleCorners.TopLeft]: rotatePoint({
      point: { x, y },
      rotationOrigin,
      rotation,
    }),
    [RectangleCorners.TopRight]: rotatePoint({
      point: { x: x + width, y },
      rotationOrigin,
      rotation,
    }),
    [RectangleCorners.BottomRight]: rotatePoint({
      point: { x: x + width, y: y + height },
      rotationOrigin,
      rotation,
    }),
    [RectangleCorners.BottomLeft]: rotatePoint({
      point: { x, y: y + height },
      rotationOrigin,
      rotation,
    }),
    origin: rotationOrigin,
  };
};

export const rotatePoint = ({
  point,
  rotationOrigin,
  rotation,
}: {
  point: Point;
  rotationOrigin: Point;
  // degrees
  rotation: number;
}): Point => {
  if (rotation === 0) {
    return point;
  }

  rotation = degreesToRadians(rotation);

  return {
    x:
      (point.x - rotationOrigin.x) * Math.cos(rotation) -
      (point.y - rotationOrigin.y) * Math.sin(rotation) +
      rotationOrigin.x,
    y:
      (point.x - rotationOrigin.x) * Math.sin(rotation) +
      (point.y - rotationOrigin.y) * Math.cos(rotation) +
      rotationOrigin.y,
  };
};

export const isPointInsideCircle = ({
  point,
  circle,
  offset = 0,
  rotation,
  rotationOrigin,
}: {
  point: Point;
  circle: Point & {
    radius: number;
  };
  offset?: number;
  rotation?: number;
  rotationOrigin?: Point;
}) => {
  if (rotation && rotationOrigin) {
    circle = {
      ...circle,
      ...rotatePoint({
        point: circle,
        rotationOrigin,
        rotation,
      }),
    };
  }

  return (
    Math.pow(point.x - circle.x + offset, 2) +
      Math.pow(point.y - circle.y + offset, 2) <=
    Math.pow(circle.radius + offset, 2)
  );
};

type Params = {
  point: Point;
  rectangle: Pick<RectangleShape, 'x' | 'y' | 'width' | 'height' | 'rotation'>;
  offset?: number;
  rotationOrigin?: Point;
};

export const convertRectangleToPolygon = ({
  rectangle,
  offset = 0,
  rotationOrigin = {
    x: rectangle.x + rectangle.width / 2,
    y: rectangle.y + rectangle.height / 2,
  },
}: Pick<Params, 'rectangle' | 'rotationOrigin' | 'offset'>): Point[] => {
  let polygon = [
    { x: rectangle.x - offset, y: rectangle.y - offset },
    { x: rectangle.width + rectangle.x + offset * 2, y: rectangle.y - offset },
    {
      x: rectangle.width + rectangle.x + offset * 2,
      y: rectangle.y + rectangle.height + offset * 2,
    },
    { x: rectangle.x - offset, y: rectangle.y + rectangle.height + offset * 2 },
    { x: rectangle.x - offset, y: rectangle.y - offset },
  ];

  if (rectangle.rotation) {
    polygon = polygon.map((point) =>
      rotatePoint({
        point,
        rotationOrigin,
        rotation: rectangle.rotation,
      })
    );
  }

  return polygon;
};

export const isPointInsideRectangle = ({
  point,
  rectangle,
  offset = 0,
  rotationOrigin = {
    x: rectangle.x + rectangle.width / 2,
    y: rectangle.y + rectangle.height / 2,
  },
}: Params): boolean => {
  let polygon = convertRectangleToPolygon({
    rectangle,
    offset,
    rotationOrigin,
  });

  return isPointInsidePolygon({ point, polygon });
};

export const isPointInsidePolygon = ({
  polygon,
  point,
}: {
  point: Point;
  polygon: Point[];
}): boolean => {
  let c = false;

  for (let i = 1, j = 0; i < polygon.length; i++, j++) {
    const ix = polygon[i].x;
    const iy = polygon[i].y;
    const jx = polygon[j].x;
    const jy = polygon[j].y;
    const iySide = iy > point.y;
    const jySide = jy > point.y;

    if (iySide !== jySide) {
      const intersectX = ((jx - ix) * (point.y - iy)) / (jy - iy) + ix;
      if (point.x < intersectX) c = !c;
    }
  }

  return c;
};

export const degreesToRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const radiansToDegrees = (radians: number) => {
  return radians * (180 / Math.PI);
};

export const isRectangleShape = (obj: GardenObject): obj is RectangleShape => {
  return (
    obj.objectType === ObjectTypes.Shape &&
    obj.shapeType === ShapeTypes.Rectangle
  );
};

export const isShape = (obj: Partial<GardenObject>): obj is Shape => {
  return obj.objectType === ObjectTypes.Shape;
};

export const isPlant = (obj: Partial<GardenObject>): obj is Plant => {
  return obj.objectType === ObjectTypes.Plant;
};

export const isRectangular = (
  obj: GardenObject
): obj is Plant | RectangleShape => {
  return isPlant(obj) || isRectangleShape(obj);
};

export const getObjectAtPoint = ({
  point,
  objects,
  offset,
}: {
  point: Point;
  objects: GardenObject[];
  offset?: number;
}): null | GardenObject => {
  let objectAtPoint = null;
  const hoveredObjects: GardenObject[] = [];

  for (let obj of objects) {
    if (
      isPointInsideRectangle({
        point,
        rectangle: obj,
        offset,
      })
    ) {
      hoveredObjects.push(obj);
    }
  }

  // Prioritize plants over objects because plants are usually put on top of them
  const hoveredPlants = hoveredObjects.filter(
    ({ objectType }) => objectType === ObjectTypes.Plant
  );

  if (hoveredPlants.length) {
    objectAtPoint = hoveredPlants[hoveredPlants.length - 1];
  } else if (hoveredObjects.length) {
    objectAtPoint = hoveredObjects[hoveredObjects.length - 1];
  }

  return objectAtPoint;
};

const isUndefined = (a: any): a is undefined => a === undefined;

// https://stackoverflow.com/questions/10962379/how-to-check-intersection-between-2-rotated-rectangles
export const doPolygonsIntersect = (a: Point[], b: Point[]) => {
  const polygons = [a, b];
  let minA, maxA, projected, i, i1, j, minB, maxB;

  for (i = 0; i < polygons.length; i++) {
    // for each polygon, look at each edge of the polygon, and determine if it separates
    // the two shapes
    var polygon = polygons[i];
    for (i1 = 0; i1 < polygon.length; i1++) {
      // grab 2 vertices to create an edge
      var i2 = (i1 + 1) % polygon.length;
      var p1 = polygon[i1];
      var p2 = polygon[i2];

      // find the line perpendicular to this edge
      var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

      minA = maxA = undefined;
      // for each vertex in the first shape, project it onto the line perpendicular to the edge
      // and keep track of the min and max of these values
      for (j = 0; j < a.length; j++) {
        projected = normal.x * a[j].x + normal.y * a[j].y;
        if (isUndefined(minA) || projected < minA) {
          minA = projected;
        }
        if (isUndefined(maxA) || projected > maxA) {
          maxA = projected;
        }
      }

      // for each vertex in the second shape, project it onto the line perpendicular to the edge
      // and keep track of the min and max of these values
      minB = maxB = undefined;
      for (j = 0; j < b.length; j++) {
        projected = normal.x * b[j].x + normal.y * b[j].y;
        if (isUndefined(minB) || projected < minB) {
          minB = projected;
        }
        if (isUndefined(maxB) || projected > maxB) {
          maxB = projected;
        }
      }

      // if there is no overlap between the projects, the edge we are looking at separates the two
      // polygons, and we know there is no overlap
      // @ts-ignore
      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }

  return true;
};

/*
If we have the coordinates of the point we are rotating, (𝑥, 𝑦), and the point we are rotating about, (ℎ, 𝑘), as well as the angle of rotation, 𝜃, then the coordinates of the image, (𝑥', 𝑦'), are as follows:

First we calculate the distance between (𝑥, 𝑦) and (ℎ, 𝑘):
𝑑 = √((𝑥 − ℎ)² + (𝑦 − 𝑘)²)

If 𝑦 ≥ 𝑘:
𝑥' = 𝑑 cos(arccos((𝑥 − ℎ)∕𝑑) + 𝜃) + ℎ
𝑦' = 𝑑 sin(arccos((𝑥 − ℎ)∕𝑑) + 𝜃) + 𝑘

If 𝑦 < 𝑘:
𝑥' = 𝑑 cos(−arccos((𝑥 − ℎ)∕𝑑) + 𝜃) + ℎ
𝑦' = 𝑑 sin(−arccos((𝑥 − ℎ)∕𝑑) + 𝜃) + 𝑘

– – –

Example: Find the image of (3, −5) under a clockwise rotation of 90° about (1, 2).

𝑑 = √((3 − 1)² + (−5 − 2)²) = √53

Clockwise rotation ⇒ 𝜃 = −90°

−5 < 2
⇒
𝑥' = √53 cos(−arccos((3 − 1)∕√53) − 90°) + 1 = −6
𝑦' = √53 sin(−arccos((3 − 1)∕√53) − 90°) + 2 = 0
 */

export const post = (
  url: string,
  init: Omit<RequestInit, 'body'> & { body: object }
) =>
  fetch(url, {
    ...init,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
    body: JSON.stringify(init.body),
  });

export const put = (
  url: string,
  init: Omit<RequestInit, 'body'> & { body: object }
) =>
  fetch(url, {
    ...init,
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
    body: JSON.stringify(init.body),
  });

export const getPlantName = (name: string, variety?: string): string => {
  let res = name;

  if (variety) {
    res += ` (${variety})`;
  }

  return res;
};

export const getTerminalDates = ({
  dateStartIndoors,
  dateTransplant,
  dateDirectSow,
  dateFirstHarvest,
  dateLastHarvest,
}: Pick<
  Plant,
  | 'dateStartIndoors'
  | 'dateTransplant'
  | 'dateDirectSow'
  | 'dateFirstHarvest'
  | 'dateLastHarvest'
>): {
  earliest: Date | undefined;
  earliestPlanting: Date | undefined;
  latestPlanting: Date | undefined;
  latestHarvest: Date | undefined;
  earliestHarvest: Date | undefined;
} => {
  const si = dateStartIndoors ? new Date(dateStartIndoors) : undefined;
  const tp = dateTransplant ? new Date(dateTransplant) : undefined;
  const ds = dateDirectSow ? new Date(dateDirectSow) : undefined;
  const fh = dateFirstHarvest ? new Date(dateFirstHarvest) : undefined;
  const lh = dateLastHarvest ? new Date(dateLastHarvest) : undefined;

  const allStartDates = compact([si, tp, ds]);
  const allPlantingDates = compact([tp, ds]);
  const allHarvestDates = compact([fh, lh]);

  return {
    earliest: isEmpty(allStartDates) ? undefined : min(allStartDates),
    earliestPlanting: isEmpty(allPlantingDates)
      ? undefined
      : min(allPlantingDates),
    latestPlanting: isEmpty(allPlantingDates)
      ? undefined
      : max(allPlantingDates),
    earliestHarvest: isEmpty(allHarvestDates)
      ? undefined
      : min(allHarvestDates),
    latestHarvest: isEmpty(allHarvestDates) ? undefined : max(allHarvestDates),
  };
};

export const isPlantOverlappingDateRange = (
  plant: Plant,
  range: { start: Date; end: Date } | null
): boolean => {
  if (!range) return true;

  const { latestHarvest, earliestPlanting } = getTerminalDates(plant);

  if (!latestHarvest || !earliestPlanting) {
    return true;
  }

  return areIntervalsOverlapping(
    { start: earliestPlanting, end: latestHarvest },
    range
  );
};
