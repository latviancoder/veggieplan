export enum Modes {
  DEFAULT = 'DEFAULT',
  SELECTION = 'SELECTION',
  CREATION = 'CREATION',
  MOVEMENT = 'MOVEMENT',
  RESIZING = 'RESIZING',
  ROTATION = 'ROTATION',
}

export enum Views {
  PLAN = 'PLAN',
  TABLE = 'TABLE',
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
  sorting: number;
  dateAdded: string;
};

type BaseShape = BaseObject & {
  objectType: ObjectTypes.Shape;
  x: number;
  y: number;
  title?: string;
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
  plantId: number;
  varietyId?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  inRowSpacing?: number;
  rowSpacing?: number;
  dateDirectSow?: string;
  dateStartIndoors?: string;
  dateTransplant?: string;
  dateFirstHarvest?: string;
  dateLastHarvest?: string;
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
  point: Point;
  selection: number;
  distance: number; // distance from the snapline to the actual position of the point
  direction: 'vertical' | 'horizontal';
};

export type PlantDetails = {
  id: number;
  code: string;
  name: string;
  latinName: string;
  familyId: number;
  alternativeNames: string[];
  spacing: number;
  inRowSpacing: number;
  rowSpacing: number;
  frostTolerant: boolean;
  plantRelativeToLastFrost: number;
  timeToMaturity: number;
  harvestRelativeToFirstFrost: number;
  perennial: boolean;
};

export type Variety = {
  id?: number;
  name: string;
  plantId: number;
};
