import { useAtomValue } from 'jotai/utils';
import { useState, useRef, useEffect, useCallback } from 'react';

import { hoveredAtom } from '../../atoms/hoveredAtom';
import { objectsAtom } from '../../atoms/objectsAtom';
import { panStartAtom } from '../../atoms/panStartAtom';
import { zoomAtom } from '../../atoms/zoomAtom';
import { ObjectTypes } from '../../types';
import { useHelpers } from '../../utils';

export const Badge = () => {
  const hoveredObjectId = useAtomValue(hoveredAtom);
  const objects = useAtomValue(objectsAtom);
  const panStart = useAtomValue(panStartAtom);
  const zoom = useAtomValue(zoomAtom);

  const { pxToMeter, getPlant } = useHelpers();
  const [textDimensions, setTextDimensions] = useState({
    width: 0,
    height: 0,
  });
  const textRef = useRef<SVGTextElement>(null);

  const obj = objects.find(
    ({ id }) => hoveredObjectId === id || panStart?.interactableObjectId === id
  );

  const plant =
    obj?.objectType === ObjectTypes.Plant && obj.plantId
      ? getPlant(obj.plantId)
      : undefined;

  useEffect(() => {
    if (textRef.current) {
      const boundingRect = textRef.current.getBoundingClientRect();
      setTextDimensions({
        width: boundingRect.width,
        height: boundingRect.height,
      });
    }
  }, [obj?.width, obj?.height, zoom]);

  const widthInMeter = pxToMeter(obj?.width);
  const heightInMeter = pxToMeter(obj?.height);

  const renderPlantSpecific = useCallback(() => {
    if (!plant) return;

    const { inRowSpacing, rowSpacing } = plant;

    const smallestSide = Math.min(heightInMeter, widthInMeter);
    const largestSide = Math.max(heightInMeter, widthInMeter);

    const rows = Math.round(smallestSide / (rowSpacing / 100));
    const inRow = Math.round(largestSide / (inRowSpacing / 100));

    return `${plant.name} - ${rows} x ${inRow} Pflanzen (${
      rows * inRow
    }) - ${widthInMeter.toFixed(2)}x${heightInMeter.toFixed(2)}m`;
  }, [heightInMeter, widthInMeter, plant]);

  const textOffset = 4;

  if (!obj) return null;

  const { width, height, rotation, x, y } = obj;

  return (
    <g
      transform={`
        translate(${x} ${y}) 
        rotate(${rotation} ${width / 2} ${height / 2})
    `}
    >
      {textDimensions.width > 0 && (
        <rect
          x={width / 2 - textDimensions.width / zoom / 2 - textOffset / zoom}
          y={height / 2 - textDimensions.height / zoom / 2 - textOffset / zoom}
          shapeRendering="crispEdges"
          fill="palegoldenrod"
          fillOpacity={0.8}
          stroke="blue"
          strokeWidth={1 / zoom}
          width={(textDimensions.width + textOffset * 2) / zoom}
          height={(textDimensions.height + textOffset * 2 - 1) / zoom}
          transform={
            rotation ? `rotate(${-rotation} ${width / 2} ${height / 2})` : ''
          }
        />
      )}
      <text
        ref={textRef}
        x={width / 2}
        y={height / 2}
        style={{ fontSize: 13 / zoom, fontFamily: 'Inconsolata' }}
        dominantBaseline="middle"
        textAnchor="middle"
        transform={
          rotation ? `rotate(${-rotation} ${width / 2} ${height / 2})` : ''
        }
      >
        {plant
          ? renderPlantSpecific()
          : `${widthInMeter.toFixed(2)}x${heightInMeter.toFixed(2)}m`}
      </text>
    </g>
  );
};
