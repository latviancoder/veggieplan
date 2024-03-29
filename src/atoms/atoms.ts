import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { isEmpty } from 'lodash';

import {
  Config,
  GardenObject,
  Modes,
  PlantDetails,
  Point,
  Variety,
  Views,
} from 'types';

export const storage = createJSONStorage<any>(() => sessionStorage);

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
export const configAtom = atomWithStorage<Config>(
  'config',
  {
    width: 10,
    height: 10,
  } as Config,
  storage
);

export const plotCanvasAtom = atom<{ width: number; height: number }>((get) => {
  const plot = get(configAtom);
  const canvas = get(canvasAtom);

  const plotCanvas = {
    width: 0,
    height: 0,
  };

  if (isEmpty(canvas) || isEmpty(plot)) return plotCanvas;

  const guidesSize = 20;

  if (canvas.width / canvas.height >= plot.width / plot.height) {
    plotCanvas.width = canvas.height * (plot.width / plot.height);
    plotCanvas.height = canvas.height - guidesSize;
  } else {
    plotCanvas.width = canvas.width - guidesSize;
    plotCanvas.height = canvas.width * (plot.height / plot.width);
  }

  return plotCanvas;
});

export const creatableAtom = atom<null | GardenObject>(null);

export const mousePositionAtom = atom<null | Point>(null);

export const offsetAtom = atom<{ x: number; y: number }>(
  {} as { x: number; y: number }
);

export const selectedPlantAtom = atom<null | number>(null);

export const plantsAtom = atom<PlantDetails[]>([]);

export const varietiesAtom = atomWithStorage<Variety[]>(
  'varieties',
  [],
  storage
);

export const viewAtom = atomWithStorage<Views>('view', Views.PLAN, storage);

export const hiddenObjectIdsAtom = atom<string[] | null>(null);

export const accessTokenAtom = atom<string>('');
