import { atom } from 'jotai';

import { roundTwoDecimals } from '../utils';
import {
  canvasAtom,
  offsetAtom,
  plantsAtom,
  plotAtom,
  plotCanvasAtom
} from './atoms';
import { zoomAtom } from './zoomAtom';

export const utilsAtom = atom((get) => {
  const canvas = get(canvasAtom);
  const zoom = get(zoomAtom);
  const offset = get(offsetAtom);
  const plot = get(plotAtom);
  const plotCanvas = get(plotCanvasAtom);
  const plants = get(plantsAtom);

  return {
    absoluteToRelativeX: (x: number): number => {
      return (x - canvas.x) / zoom + offset.x;
    },
    absoluteToRelativeY: (y: number): number => {
      return (y - canvas.y) / zoom + offset.y;
    },
    relativeToAbsoluteX: (x: number) => {
      return canvas.x - offset.x * zoom + x * zoom;
    },
    relativeToAbsoluteY: (y: number) => {
      return canvas.y - offset.y * zoom + y * zoom;
    },
    pxToMeter: (px: number = 0, noZoom = false): number => {
      const meterInPx = plotCanvas.width / plot.width;
      return roundTwoDecimals(px / meterInPx / (noZoom ? 1 : zoom));
    },
    meterToPx: (meters: number = 0, noZoom = false): number => {
      return roundTwoDecimals(
        ((meters * plotCanvas.width) / plot.width) * (noZoom ? 1 : zoom)
      );
    },
    getPlantDetails: (plantId: number) => {
      return plants.find(({ id }) => id === plantId)!;
    },
  };
});
