import { useAtomValue } from 'jotai/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

import { creatableAtom } from '../../atoms/atoms';
import { hoveredAtom } from '../../atoms/hoveredAtom';
import { objectsAtom } from '../../atoms/objectsAtom';
import { panStartAtom } from '../../atoms/panStartAtom';
import { zoomAtom } from '../../atoms/zoomAtom';
import { ObjectTypes } from '../../types';
import { isPlant, useUtils } from '../../utils';

export const Badge = () => {
  const hoveredObjectId = useAtomValue(hoveredAtom);
  const objects = useAtomValue(objectsAtom);
  const panStart = useAtomValue(panStartAtom);
  const zoom = useAtomValue(zoomAtom);
  const creatable = useAtomValue(creatableAtom);

  const { pxToMeter, getPlantDetails, getPlantAmount } = useUtils();
  const [textDimensions, setTextDimensions] = useState({
    width: 0,
    height: 0,
  });
  const textRef = useRef<SVGTextElement>(null);

  const obj =
    objects.find(
      ({ id }) =>
        hoveredObjectId === id || panStart?.interactableObjectId === id
    ) || creatable;

  const plantDetails = obj && isPlant(obj) ? getPlantDetails(obj) : undefined;

  useEffect(() => {
    if (textRef.current) {
      const boundingRect = textRef.current.getBoundingClientRect();
      setTextDimensions({
        width: boundingRect.width,
        height: boundingRect.height,
      });
    }
  }, [obj?.width, obj?.height, zoom]);

  const widthInMeter = pxToMeter(obj?.width, true);
  const heightInMeter = pxToMeter(obj?.height, true);

  const renderPlantSpecific = useCallback(() => {
    if (!plantDetails || !obj || !isPlant(obj)) return;

    const { rows, inRow } = getPlantAmount(obj);

    return `${plantDetails.name} - ${rows} x ${inRow} Pflanzen (${
      rows * inRow
    }) - ${widthInMeter.toFixed(2)}x${heightInMeter.toFixed(2)}m`;
  }, [heightInMeter, widthInMeter, plantDetails, getPlantAmount, obj]);

  const renderShapeSpecific = useCallback(() => {
    let ret = `${widthInMeter.toFixed(2)}x${heightInMeter.toFixed(2)}m`;

    if (obj?.objectType === ObjectTypes.Shape && obj.title) {
      ret = `Beet ${obj.title} - ${ret}`;
    }

    return ret;
  }, [heightInMeter, obj, widthInMeter]);

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
        style={{ fontSize: 13 / zoom, fontFamily: 'Roboto Mono' }}
        dominantBaseline="middle"
        textAnchor="middle"
        transform={
          rotation ? `rotate(${-rotation} ${width / 2} ${height / 2})` : ''
        }
      >
        {plantDetails ? renderPlantSpecific() : renderShapeSpecific()}
      </text>
    </g>
  );
};
