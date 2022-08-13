import { RectangleCorners, RectangleShape } from 'types';

import { HANDLER_OFFSET, HANDLER_SIZE } from '../constants';

export const rectangleHandlerMap = (
  {
    x = 0,
    y = 0,
    width,
    height,
  }: Pick<RectangleShape, 'x' | 'y' | 'width' | 'height'>,
  zoom: number
) => {
  return new Map([
    [
      RectangleCorners.TopLeft,
      {
        x: x - HANDLER_OFFSET / zoom,
        y: y - HANDLER_OFFSET / zoom,
      },
    ],
    [
      RectangleCorners.TopRight,
      {
        x: x + width + HANDLER_OFFSET / zoom - HANDLER_SIZE / zoom,
        y: y - HANDLER_OFFSET / zoom,
      },
    ],
    [
      RectangleCorners.BottomRight,
      {
        x: x + width + HANDLER_OFFSET / zoom - HANDLER_SIZE / zoom,
        y: y + height + HANDLER_OFFSET / zoom - HANDLER_SIZE / zoom,
      },
    ],
    [
      RectangleCorners.BottomLeft,
      {
        x: x - HANDLER_OFFSET / zoom,
        y: y + height + HANDLER_OFFSET / zoom - HANDLER_SIZE / zoom,
      },
    ],
  ]);
};
