import { memo } from 'react';
import { ObjectTypes, Plant, RectangleShape } from '../types';
import { zoomAtom } from '../atoms/zoomAtom';
import { HANDLER_OFFSET, HANDLER_SIZE } from '../constants';
import { rectangleHandlerMap } from '../utils/rectangleHandlerMap';
import { useAtomValue } from 'jotai/utils';
import { RectangleBadge } from './bagde/RectangleBadge';

type Props = (RectangleShape | Plant) & {
  isSelected?: boolean;
  isInteracted?: boolean;
  isHovered?: boolean;
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
    rotation,
    ...rest
  }: Props) => {
    const zoom = useAtomValue(zoomAtom);

    let fill = '#fff';
    let stroke = 'black';
    if (isSelected) {
      stroke = 'red';
    }
    if (isInteracted) {
      stroke = 'blue';
    }

    if (isHovered) {
      fill = '#eee';
    }

    let plantIconSize = 30;

    if (plantIconSize > Math.min(width, height) - 20) {
      plantIconSize = width - 10;
    }

    if (plantIconSize * zoom > 40) {
      plantIconSize = 40 / zoom;
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

        {(isHovered || isInteracted) && (
          <RectangleBadge
            plantID={
              rest.objectType === ObjectTypes.Plant ? rest.plantID : undefined
            }
            width={width}
            height={height}
            rotation={rotation}
          />
        )}

        {!isHovered &&
          !isInteracted &&
          rest.objectType === ObjectTypes.Plant &&
          rest.plantID && (
            <image
              href="image/garlic.png"
              height={plantIconSize}
              width={plantIconSize}
              x={width / 2 - plantIconSize / 2}
              y={height / 2 - plantIconSize / 2}
              transform={
                rotation
                  ? `rotate(${-rotation} ${width / 2} ${height / 2})`
                  : ''
              }
            />
          )}

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
