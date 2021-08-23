import { Rectangle } from './shapes/Rectangle';
import { useAtom } from 'jotai/esm';
import { plotAtom, plotCanvasAtom } from './atoms/atoms';
import { zoomAtom } from './atoms/zoomAtom';
import {
  Point,
  RectangleCorners,
  RectangleShape,
  GardenObject,
  ObjectTypes,
  ShapeTypes,
  SnapLine,
} from './types';
import { HANDLER_OFFSET, SNAPPING_THRESHOLD } from './constants';

export const roundTwoDecimals = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const useConversionHelpers = () => {
  const [plot] = useAtom(plotAtom);
  const [plotCanvas] = useAtom(plotCanvasAtom);

  return {
    pxToMeter: (px: number = 0): number => {
      const meterInPx = plotCanvas.width / plot.width;
      return roundTwoDecimals(px / meterInPx);
    },
  };
};

export const rotateRectangle = ({
  rectangle: { x, y, width, height, rotation },
  rotationOrigin = { x: x + width / 2, y: y + height / 2 },
}: {
  rectangle: RectangleShape;
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

type Params = {
  point: Point;
  rectangle: Pick<RectangleShape, 'x' | 'y' | 'width' | 'height' | 'rotation'>;
  offset?: number;
  rotationOrigin?: Point;
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

export const isPointInsideRectangle = ({
  point,
  rectangle,
  offset = 0,
  rotationOrigin = {
    x: rectangle.x + rectangle.width / 2,
    y: rectangle.y + rectangle.height / 2,
  },
}: Params): boolean => {
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

export const isRectangle = (obj: GardenObject): obj is RectangleShape => {
  return (
    obj.objectType === ObjectTypes.Shape &&
    obj.shapeType === ShapeTypes.Rectangle
  );
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
