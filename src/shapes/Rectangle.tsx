import React, { memo, useEffect, useRef, useState } from 'react';
import { ObjectTypes, Plant, RectangleShape } from '../types';
import {
  degreesToRadians,
  getPlant,
  radiansToDegrees,
  rotatePoint,
  roundTwoDecimals,
  useConversionHelpers,
} from '../utils';
import { useAtom } from 'jotai';
import { zoomAtom } from '../atoms/zoomAtom';
import { HANDLER_OFFSET, HANDLER_SIZE } from '../constants';
import { rectangleHandlerMap } from '../utils/rectangleHandlerMap';
import { ReactComponent as Tomato } from '../icons/tomato.svg';
import { plants } from '../data/plants';
import { useAtomValue } from 'jotai/utils';
import { RectangleBadge } from './bagde/RectangleBadge';

type Props = (RectangleShape | Plant) & {
  isSelected?: boolean;
  isHighlighted?: boolean;
  isHovered?: boolean;
};

export const Rectangle = memo(
  ({
    x,
    y,
    width,
    height,
    isSelected,
    isHighlighted,
    isHovered,
    rotation,
    ...rest
  }: Props) => {
    const zoom = useAtomValue(zoomAtom);

    let fill = '#fff';
    let stroke = 'black';
    if (isSelected) {
      stroke = 'red';
    }
    if (isHighlighted) {
      stroke = 'blue';
    }

    if (isHovered) {
      fill = '#eee';
    }

    const render = () => (
      <>
        <rect
          shapeRendering={rotation ? 'auto' : 'crispEdges'}
          strokeWidth={1 / zoom}
          stroke={stroke}
          fill={fill}
          fillOpacity={0.7}
          width={width}
          height={height}
        />

        <RectangleBadge
          plantID={
            rest.objectType === ObjectTypes.Plant ? rest.plantID : undefined
          }
          width={width}
          height={height}
          rotation={rotation}
        />

        {/* Resize/Rotate handlers */}
        {isSelected && (
          <>
            {[...rectangleHandlerMap({ x: 0, y: 0, width, height }, zoom)].map(
              ([key, { x, y }]) => (
                <rect
                  key={key}
                  fill="green"
                  width={HANDLER_SIZE / zoom}
                  height={HANDLER_SIZE / zoom}
                  transform={`translate(${x} ${y})`}
                />
              )
            )}
            <circle
              fill="green"
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
