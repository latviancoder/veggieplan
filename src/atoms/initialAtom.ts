// On initial app load position plot canvas in the middle of canvas and zoom out one level
import { atom } from 'jotai';
import { zoomAtom } from './zoomAtom';
import { canvasAtom, offsetAtom, plotAtom, plotCanvasAtom } from './atoms';

export const initialAtom = atom(null, (get, set, { canvas }: any) => {
  const plot = get(plotAtom);
  const zoom = get(zoomAtom);

  const plotCanvas = {
    width: 0,
    height: 0,
  };

  const offset = {
    x: 0,
    y: 0,
  };

  if (canvas.width / canvas.height >= plot.width / plot.height) {
    plotCanvas.width = canvas.height * (plot.width / plot.height);
    plotCanvas.height = canvas.height;
    offset.x = -(canvas.width / 2 - plotCanvas.width / 2);
  } else {
    plotCanvas.width = canvas.width;
    plotCanvas.height = canvas.width * (plot.height / plot.width);
    offset.y = -(canvas.height / 2 - plotCanvas.height / 2);
  }

  set(canvasAtom, canvas);
  set(plotCanvasAtom, plotCanvas);
  set(offsetAtom, offset);

  if (zoom === 1) {
    // set(zoomAtom, { direction: 'zoomOut' });
  }
});
