import { atom } from 'jotai';

import { canvasAtom, offsetAtom, configAtom, plotCanvasAtom } from './atoms';

// Position plot canvas in the middle of canvas
export const initialOffsetAtom = atom(null, (get, set) => {
  const plot = get(configAtom);
  const canvas = get(canvasAtom);
  const plotCanvas = get(plotCanvasAtom);

  const offset = {
    x: 0,
    y: 0,
  };

  const guidesSize = 20;

  if (canvas.width / canvas.height >= plot.width / plot.height) {
    offset.x = -(canvas.width / 2 - plotCanvas.width / 2);
    offset.y = -guidesSize;
  } else {
    offset.y = -(canvas.height / 2 - plotCanvas.height / 2);
    offset.x = -guidesSize;
  }

  set(offsetAtom, offset);
});
