import { PlantDetails } from './../types';
import { atom } from 'jotai';
import { GardenObject, Modes, Point } from '../types';

export const modeAtom = atom(Modes.CREATION);

export const canvasAtom = atom({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

// In meters
export const plotAtom = atom({
  width: 10,
  height: 10,
});

export const plotCanvasAtom = atom({
  width: 0,
  height: 0,
});

export const creatableAtom = atom<null | GardenObject>(null);

export const mousePositionAtom = atom<null | Point>(null);

export const offsetAtom = atom({ x: 0, y: 0 });

export const selectedPlantAtom = atom<null | number>(null);

export const plantsAtom = atom<PlantDetails[]>([]);
