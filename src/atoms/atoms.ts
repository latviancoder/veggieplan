import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { GardenObject, Modes, PlantDetails, Point, Views } from '../types';

export const modeAtom = atom(Modes.DEFAULT);

export const canvasAtom = atom<{
  x: number;
  y: number;
  width: number;
  height: number;
}>(
  {} as {
    x: number;
    y: number;
    width: number;
    height: number;
  }
);

// In meters
export const plotAtom = atom({
  width: 20,
  height: 10,
});

export const plotCanvasAtom = atom<{ width: number; height: number }>(
  {} as { width: number; height: number }
);

export const creatableAtom = atom<null | GardenObject>(null);

export const mousePositionAtom = atom<null | Point>(null);

export const offsetAtom = atom({ x: 0, y: 0 });

export const selectedPlantAtom = atom<null | number>(null);

export const plantsAtom = atom<PlantDetails[]>([]);

export const viewAtom = atomWithStorage<Views>('view', Views.PLAN);
