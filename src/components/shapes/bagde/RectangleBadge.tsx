import { useAtomValue } from 'jotai/utils';
import { useEffect, useRef, useState } from 'react';
import { zoomAtom } from '../../../atoms/zoomAtom';
import { useHelpers } from '../../../utils';

type Props = {
  width: number;
  height: number;
  rotation: number;
  plantId?: number;
};

export const RectangleBadge = ({ width, height, plantId, rotation }: Props) => {
  const { pxToMeter, getPlant } = useHelpers();
  const [textDimensions, setTextDimensions] = useState({
    width: 0,
    height: 0,
  });
  const textRef = useRef<SVGTextElement>(null);

  const zoom = useAtomValue(zoomAtom);

  const widthInMeter = pxToMeter(width);
  const heightInMeter = pxToMeter(height);

  useEffect(() => {
    if (textRef.current) {
      const boundingRect = textRef.current.getBoundingClientRect();
      setTextDimensions({
        width: boundingRect.width,
        height: boundingRect.height,
      });
    }
  }, [width, height, zoom]);

  const textOffset = 4;

  const renderPlantSpecific = (id: number) => {
    const plant = getPlant(id);
    const { inRowSpacing, rowSpacing } = plant;

    const smallestSide = Math.min(heightInMeter, widthInMeter);
    const largestSide = Math.max(heightInMeter, widthInMeter);

    const rows = Math.round(smallestSide / (rowSpacing / 100));
    const inRow = Math.round(largestSide / (inRowSpacing / 100));

    return `${plant.name} - ${rows} x ${inRow} Pflanzen (${
      rows * inRow
    }) - ${widthInMeter.toFixed(2)}x${heightInMeter.toFixed(2)}`;
  };

  return (
    <>
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
        {plantId
          ? renderPlantSpecific(plantId)
          : `${width.toFixed(2)}x${height.toFixed(2)}`}
      </text>
    </>
  );
};