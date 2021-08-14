import { atom } from 'jotai';
import { roundTwoDecimals } from '../utils';
import { Easing, Tween } from '@tweenjs/tween.js';
import { canvasAtom, offsetAtom } from './atoms';
import { Point } from '../types';

const _zoomAtom = atom(1);

export const zoomAtom = atom<
  number,
  {
    direction?: 'zoomIn' | 'zoomOut';
    center?: Point;
    delta?: number;
    withTween?: boolean;
  }
>(
  (get) => get(_zoomAtom),
  (get, set, { direction, center, delta, withTween }) => {
    const offset = get(offsetAtom);
    const canvas = get(canvasAtom);
    const zoom = get(_zoomAtom);

    // Depending on zoom center point we also need to change svg offset
    // When user uses pinch or doubletap custom zooming center is used, otherwise it's always in the middle
    // Where horizontally? 0 means left, 2 right. 1 is middle.
    // Where vertically? 0 means top, 2 bottom. 1 is middle.
    let coeffLeftRight = 1;
    let coeffTopBottom = 1;

    if (center) {
      coeffLeftRight = ((center.x - canvas.x) / canvas.width) * 2;
      coeffTopBottom = ((center.y - canvas.y) / canvas.height) * 2;
    }

    const setZoomAndOffset = (nextZoom: number) => {
      set(_zoomAtom, nextZoom);

      set(offsetAtom, () => ({
        x:
          offset.x +
          (canvas.width * (1 / zoom - 1 / nextZoom) * coeffLeftRight) / 2,
        y:
          offset.y +
          (canvas.height * (1 / zoom - 1 / nextZoom) * coeffTopBottom) / 2,
      }));
    };

    if (direction) {
      // Regular zooming in using UI or doubleclick
      const nextZoom = roundTwoDecimals(
        direction === 'zoomIn' ? zoom * 1.25 : zoom / 1.25
      );

      if (withTween) {
        // Smoothly tween to new zoom value instead of switching immediately
        new Tween({ zoom })
          .to({ zoom: nextZoom }, 400)
          .easing(Easing.Quadratic.Out)
          .onUpdate((update) => {
            setZoomAndOffset(update.zoom);
          })
          .start();
      } else {
        setZoomAndOffset(nextZoom);
      }
    } else if (!direction && typeof delta === 'number') {
      // This happens on pinching or when using mousewheel
      // In case delta is provided and we also don't need tweening because there are multiple events fired anyways
      const nextZoom = Math.max(zoom - delta * 0.003, 0.1);
      setZoomAndOffset(nextZoom);
    }
  }
);
