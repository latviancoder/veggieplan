import { useAtomValue } from 'jotai/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

import { creatableAtom } from '../../atoms/atoms';
import { hoveredAtom } from '../../atoms/hoveredAtom';
import { objectsAtom } from '../../atoms/objectsAtom';
import { panStartAtom } from '../../atoms/panStartAtom';
import { zoomAtom } from '../../atoms/zoomAtom';
import { ObjectTypes, Plant, Shape } from '../../types';
import { isPlant, useUtils } from '../../utils';

export const Badge = () => {
  const hoveredObjectId = useAtomValue(hoveredAtom);
  const objects = useAtomValue(objectsAtom);
  const panStart = useAtomValue(panStartAtom);
  const zoom = useAtomValue(zoomAtom);
  const creatable = useAtomValue(creatableAtom);

  const { getPlantDetails, getPlantAmount, pxToMeterObject } = useUtils();

  const [textDimensions, setTextDimensions] = useState({
    width: 0,
    height: 0,
  });
  const textRef = useRef<SVGTextElement>(null);

  let obj =
    objects.find(
      ({ id }) =>
        hoveredObjectId === id || panStart?.interactableObjectId === id
    ) || creatable;

  useEffect(() => {
    if (textRef.current) {
      const boundingRect = textRef.current.getBoundingClientRect();
      setTextDimensions({
        width: boundingRect.width,
        height: boundingRect.height,
      });
    }
  }, [obj?.width, obj?.height, zoom]);

  const renderPlantSpecific = useCallback(
    (plant: Plant) => {
      plant = pxToMeterObject(plant, true);

      const plantDetails = getPlantDetails(plant);

      const { rows, inRow } = getPlantAmount(plant);

      return `${plantDetails.name} - ${rows} x ${inRow} Pflanzen (${
        rows * inRow
      }) - ${plant.width.toFixed(2)}x${plant.height.toFixed(2)}m`;
    },
    [getPlantAmount, getPlantDetails, pxToMeterObject]
  );

  const renderShapeSpecific = useCallback(
    (shape: Shape) => {
      shape = pxToMeterObject(shape, true);

      let ret = `${shape.width.toFixed(2)}x${shape.height.toFixed(2)}m`;

      if (shape.objectType === ObjectTypes.Shape && shape.title) {
        ret = `Beet ${shape.title} - ${ret}`;
      }

      return ret;
    },
    [pxToMeterObject]
  );

  const textOffset = 4;

  if (!obj) return null;

  const { width, height, rotation, x, y } = obj;

  return (
    <g
      style={{ pointerEvents: 'none' }}
      transform={`
        translate(${x} ${y})  
        rotate(${rotation} ${width / 2} ${height / 2})
    `}
    >
      {textDimensions.width > 0 && (
        <rect
          x={width / 2 - textDimensions.width / zoom / 2 - textOffset / zoom}
          y={height / 2 - textDimensions.height / zoom / 2 - textOffset / zoom}
          shapeRendering="none"
          fill="palegoldenrod"
          fillOpacity={0.8}
          // stroke="blue"
          // strokeWidth={1 / zoom}
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
        {isPlant(obj) ? renderPlantSpecific(obj) : renderShapeSpecific(obj)}
      </text>
    </g>
  );
};
