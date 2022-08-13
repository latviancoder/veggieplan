import { Colors } from '@blueprintjs/core';
import { useAtomValue } from 'jotai/utils';
import { memo } from 'react';

import { zoomAtom } from 'atoms';
import { ObjectTypes, Plant, RectangleShape } from 'types';

import { HANDLER_OFFSET, HANDLER_SIZE } from '../../constants';
import { rectangleHandlerMap } from '../../utils/rectangleHandlerMap';
import { isPlant } from '../../utils/utils';

type Props = (RectangleShape | Plant) & {
  isSelected?: boolean;
  isHidden?: boolean;
  isInteracted?: boolean;
  isHovered?: boolean;
  borderRadius?: number;
  hasPicture?: boolean;
  code?: string;
};

export const Rectangle = memo(
  ({
    x,
    y,
    width,
    height,
    isSelected,
    isInteracted,
    isHovered,
    isHidden,
    rotation,
    borderRadius,
    hasPicture,
    code,
    ...rest
  }: Props) => {
    const zoom = useAtomValue(zoomAtom);

    let strokeWidth = 2 / zoom;
    let fillOpacity = 1;
    let fill = isPlant(rest) ? Colors.SEPIA5 : 'transparent';
    let stroke = Colors.SEPIA2;
    if (isSelected) {
      stroke = Colors.VIOLET1;
    }
    if (isInteracted) {
      stroke = Colors.COBALT1;
    }

    if (isHovered) {
      stroke = Colors.COBALT1;
      if (isPlant(rest)) {
        fill = Colors.SEPIA4;
      } else {
        fill = 'transparent';
      }
    }

    if (isHidden) {
      stroke = '#eee';
      fill = '#eee';
    }

    let plantIconSize = 30;

    if (plantIconSize * zoom < 30) {
      plantIconSize = 30 / zoom;
    }

    if (plantIconSize > Math.min(width, height) - 10 / zoom) {
      plantIconSize = Math.min(width, height) - 10 / zoom;
    }

    if (plantIconSize * zoom > 40) {
      plantIconSize = 40 / zoom;
    }

    const render = () => (
      <>
        <rect
          shapeRendering="auto"
          strokeWidth={strokeWidth}
          stroke={stroke}
          fill={fill}
          fillOpacity={fillOpacity}
          width={width}
          height={height}
          rx={isPlant(rest) ? borderRadius : 0}
          ry={isPlant(rest) ? borderRadius : 0}
        />

        {rest.objectType === ObjectTypes.Shape && rest.title && (
          <>
            <text
              textAnchor="end"
              x={-3 / zoom}
              y={10 / zoom}
              style={{ fontSize: 13 / zoom }}
            >
              {rest.title}
            </text>
          </>
        )}

        {!isHovered && !isInteracted && isPlant(rest) && (
          <image
            style={isHidden ? { filter: 'grayscale(1)' } : {}}
            href={hasPicture ? `image/${code?.trim()}.png` : 'image/plant.png'}
            height={plantIconSize > 1 ? plantIconSize : 1}
            width={plantIconSize > 1 ? plantIconSize : 1}
            x={width / 2 - plantIconSize / 2}
            y={height / 2 - plantIconSize / 2}
            transform={
              rotation ? `rotate(${-rotation} ${width / 2} ${height / 2})` : ''
            }
          />
        )}

        {/* Resize/Rotate handlers */}
        {isSelected && (
          <>
            {[...rectangleHandlerMap({ x: 0, y: 0, width, height }, zoom)].map(
              ([key, { x: handlerX, y: handlerY }]) => (
                <rect
                  key={key}
                  fill={Colors.COBALT1}
                  width={HANDLER_SIZE / zoom}
                  height={HANDLER_SIZE / zoom}
                  transform={`translate(${handlerX} ${handlerY})`}
                />
              )
            )}
            <circle
              fill={Colors.COBALT1}
              cx={width / 2}
              cy={HANDLER_SIZE / zoom / 2 - HANDLER_OFFSET / zoom}
              r={HANDLER_SIZE / zoom / 2}
            />
          </>
        )}
      </>
    );

    return (
      <g
        transform={`
          translate(${x} ${y}) 
          rotate(${rotation} ${width / 2} ${height / 2})
        `}
      >
        {render()}
      </g>
    );
  }
);

Rectangle.displayName = 'Rectangle';
