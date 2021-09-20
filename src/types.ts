export enum Modes {
  DEFAULT = 'DEFAULT',
  CREATION = 'CREATION',
  MOVEMENT = 'MOVEMENT',
  RESIZING = 'RESIZING',
  ROTATION = 'ROTATION',
}

export enum ObjectTypes {
  Plant,
  Shape,
  Item,
}

export enum ShapeTypes {
  Rectangle,
  Ellipse,
  Triangle,
  Line,
}

type BaseObject = {
  id: string;
  zIndex?: number;
  rotation: number;
  dateAdded: number;
};

type BaseShape = BaseObject & {
  objectType: ObjectTypes.Shape;
  x: number;
  y: number;
};

export type RectangleShape = BaseShape & {
  shapeType: ShapeTypes.Rectangle;
  width: number;
  height: number;
};

// todo add more shapes
export type Shape = RectangleShape;

export type Plant = BaseObject & {
  objectType: ObjectTypes.Plant;
  plantID: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GardenObject = Plant | Shape;

export enum RectangleCorners {
  TopLeft = 'TopLeft',
  TopRight = 'TopRight',
  BottomRight = 'BottomRight',
  BottomLeft = 'BottomLeft',
}

export type Point = { x: number; y: number };

export type SnapLine = {
  pointFrom: Point;
  pointTo: Point;
  distance: number; // distance from the snapline to the actual position of the point
  direction: 'vertical' | 'horizontal';
};
