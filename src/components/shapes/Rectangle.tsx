import { memo } from 'react';
import { ObjectTypes, Plant, RectangleShape } from '../../types';
import { zoomAtom } from '../../atoms/zoomAtom';
import { HANDLER_OFFSET, HANDLER_SIZE } from '../../constants';
import { rectangleHandlerMap } from '../../utils/rectangleHandlerMap';
import { useAtomValue } from 'jotai/utils';

type Props = (RectangleShape | Plant) & {
  isSelected?: boolean;
  isInteracted?: boolean;
  isHovered?: boolean;
  borderRadius?: number;
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
    borderRadius,
    ...rest
  }: Props) => {
    const zoom = useAtomValue(zoomAtom);

    const isPlant = (obj: Partial<Props>): obj is Plant =>
      obj.objectType === ObjectTypes.Plant;

    let strokeWidth = 2 / zoom;
    let fillOpacity = 0.5;
    let fill = isPlant(rest) ? '#b6dbb7' : 'transparent';
    let stroke = isPlant(rest) ? 'transparent' : '#ba9c4a';
    if (isSelected) {
      stroke = '#e3938a';
    }
    if (isInteracted) {
      stroke = '#8a9fe3';
    }

    if (isHovered) {
      stroke = '#8ce38a';
      if (isPlant(rest)) {
        fill = '#a5d4a7';
      } else {
        fill = 'transparent';
        fillOpacity = 1;
      }
    }

    let plantIconSize = 30;

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

        {!isHovered && !isInteracted && isPlant(rest) && (
          <image
            href={`image/${rest.plantId}.png`}
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
