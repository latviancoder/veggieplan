import { atom } from 'jotai';
import { zoomAtom } from './zoomAtom';
import { roundTwoDecimals } from '../utils';
import {
  canvasAtom,
  mousePositionAtom,
  offsetAtom,
  plotAtom,
  plotCanvasAtom,
} from './atoms';

export const infoAtom = atom((get) => {
  const mousePosition = get(mousePositionAtom);
  const plot = get(plotAtom);
  const canvas = get(canvasAtom);
  const plotCanvas = get(plotCanvasAtom);
  const zoom = get(zoomAtom);
  const offset = get(offsetAtom);

  if (!canvas.width) {
    return null;
  }

  const realWidth = (canvas.width * plot.width) / plotCanvas.width / zoom;
  const realHeight = (canvas.height * plot.height) / plotCanvas.height / zoom;
  const meterInPx = roundTwoDecimals(plotCanvas.width / plot.width);

  return {
    realWidth,
    realHeight,
    meterInPx,
    mousePositionRelative: {
      x: mousePosition.x + offset.x * zoom,
      y: mousePosition.y + offset.y * zoom,
    },
  };
});
