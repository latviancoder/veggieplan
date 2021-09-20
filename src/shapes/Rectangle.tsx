import React, { memo } from 'react';
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
    const { pxToMeter } = useConversionHelpers();
    const [zoom] = useAtom(zoomAtom);

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

    if (rest.objectType === ObjectTypes.Plant) {
      // Area in centimeters
      const area = pxToMeter(width) * pxToMeter(height) * 10000;
      const { inRowSpacing, rowSpacing } = getPlant(rest.plantID);
      const plantArea = inRowSpacing * rowSpacing;
      const smallestSide = Math.min(width, height);
      // console.log('rows', Math.ceil(smallestSide / rowSpacing));

      // console.log(Math.ceil(area / plantArea));
      // console.log(
      //   'rows',
      //   Math.round(
      //     (Math.min(pxToMeter(width), pxToMeter(height)) / rowSpacing) * 100
      //   )
      // );
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
        <text
          x={width / 2}
          y={height / 2}
          style={{ fontSize: 13 / zoom }}
          dominantBaseline="middle"
          textAnchor="middle"
          transform={
            rotation ? `rotate(${-rotation} ${width / 2} ${height / 2})` : ''
          }
        >
          {pxToMeter(width)}x{pxToMeter(height)}
          {/* <tspan x="0" dy="1.2em">
            width: {roundTwoDecimals(width)}, height: {roundTwoDecimals(height)}
          </tspan>
          <tspan x="0" dy="1.2em">
            {pxToMeter(width)}x{pxToMeter(height)}
          </tspan> */}
        </text>

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
      <>
        <g
          transform={`
            translate(${x} ${y}) 
            rotate(${rotation} ${width / 2} ${height / 2})
          `}
        >
          {render()}
        </g>

        {/*<g transform={`translate(${x} ${y})`}>{render()}</g>*/}
      </>
    );
  }
);
