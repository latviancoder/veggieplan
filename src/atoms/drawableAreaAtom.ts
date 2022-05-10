import { atom } from 'jotai';

import { canvasAtom, offsetAtom, plotAtom, plotCanvasAtom } from './atoms';
import { zoomAtom } from './zoomAtom';

// Position plot canvas in the middle of canvas
export const drawableAreaAtom = atom(null, (get, set) => {
  const plot = get(plotAtom);
  const zoom = get(zoomAtom);
  const canvas = get(canvasAtom);

  const plotCanvas = {
    width: 0,
    height: 0,
  };

  const offset = {
    x: 0,
    y: 0,
  };

  const guidesSize = 20;

  if (canvas.width / canvas.height >= plot.width / plot.height) {
    plotCanvas.width = canvas.height * (plot.width / plot.height);
    plotCanvas.height = canvas.height - guidesSize;
    offset.x = -(canvas.width / 2 - plotCanvas.width / 2);
    offset.y = -guidesSize;
  } else {
    plotCanvas.width = canvas.width - guidesSize;
    plotCanvas.height = canvas.width * (plot.height / plot.width);
    offset.y = -(canvas.height / 2 - plotCanvas.height / 2);
    offset.x = -guidesSize;
  }

  set(plotCanvasAtom, plotCanvas);
  set(offsetAtom, offset);

  if (zoom === 1) {
    // set(zoomAtom, { direction: 'zoomOut' });
  }
});
