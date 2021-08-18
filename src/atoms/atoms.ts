import { SnapLine } from './../types';
import { atom } from 'jotai';
import { GardenObject, Modes, RectangleCorners } from '../types';

export const modeAtom = atom(Modes.CREATION);

export const canvasAtom = atom({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

// In meters
export const plotAtom = atom({
  width: 20,
  height: 15,
});

export const plotCanvasAtom = atom({
  width: 0,
  height: 0,
});

export const creatableAtom = atom<null | GardenObject>(null);

export const mousePositionAtom = atom({ x: 0, y: 0 });

export const offsetAtom = atom({ x: 0, y: 0 });

export const snapLinesAtom = atom<SnapLine[]>([]);
