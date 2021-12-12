import { atom } from 'jotai';

import { roundTwoDecimals } from '../utils';
import {
  canvasAtom,
  mousePositionAtom,
  plotAtom,
  plotCanvasAtom
} from './atoms';
import { utilsAtom } from './utilsAtom';

export const infoAtom = atom((get) => {
  const { meterToPx } = get(utilsAtom);

  const plot = get(plotAtom);
  const canvas = get(canvasAtom);
  const plotCanvas = get(plotCanvasAtom);

  if (!canvas.width) {
    return null;
  }

  const realWidth = meterToPx(plot.width);
  const realHeight = meterToPx(plot.height);
  const meterInPx = roundTwoDecimals(plotCanvas.width / plot.width);

  return {
    realWidth,
    realHeight,
    meterInPx,
    // mousePositionRelative: mousePosition && {
    //   x: absoluteToRelativeX(mousePosition.x),
    //   y: absoluteToRelativeY(mousePosition.y),
    // },
  };
});
