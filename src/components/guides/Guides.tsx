import { scaleLinear } from 'd3-scale';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { useCallback, useMemo } from 'react';

import { Colors } from '@blueprintjs/core';

import {
  canvasAtom,
  offsetAtom,
  plotAtom,
  plotCanvasAtom
} from '../../atoms/atoms';
import { infoAtom } from '../../atoms/infoAtom';
import { zoomAtom } from '../../atoms/zoomAtom';

export const Guides = () => {
  const offset = useAtomValue(offsetAtom);
  const info = useAtomValue(infoAtom);
  const zoom = useAtomValue(zoomAtom);
  const plot = useAtomValue(plotAtom);
  const plotCanvas = useAtomValue(plotCanvasAtom);
  const canvas = useAtomValue(canvasAtom);

  const guideSize = 20;
  const guideFill = Colors.LIGHT_GRAY5;

  const calculateTicks = useCallback(
    (plotCanvasSize: number, canvasSize: number, plotSize: number) => {
      const plotCanvasScreenPercentage = (plotCanvasSize / canvasSize) * zoom;
      const ticksCount = Math.max(12 * plotCanvasScreenPercentage, 4);

      const ticks = scaleLinear().domain([0, plotSize]).ticks(ticksCount);

      if (!ticks.includes(0)) {
        ticks.push(0);
      }

      if (!ticks.includes(plotSize)) {
        ticks.push(plotSize);
      }

      return ticks;
    },
    [zoom]
  );

  const horizontalTicks = useMemo(
    () => calculateTicks(plotCanvas.width, canvas.width, plot.width),
    [calculateTicks, plotCanvas.width, canvas.width, plot.width]
  );

  const verticalTicks = useMemo(
    () => calculateTicks(plotCanvas.height, canvas.height, plot.height),
    [calculateTicks, plotCanvas.height, canvas.height, plot.height]
  );

  if (!info) {
    return null;
  }

  return (
    <g transform={`translate(${offset.x} ${offset.y}) scale(${1 / zoom})`}>
      <line
        x1={0}
        y1={guideSize}
        x2={canvas.width}
        y2={guideSize}
        stroke={Colors.LIGHT_GRAY1}
      />
      <line
        x1={guideSize}
        y1={0}
        x2={guideSize}
        y2={canvas.height}
        stroke={Colors.LIGHT_GRAY1}
      />
      <rect width={guideSize} height={canvas.height} fill={guideFill} />
      <rect
        y={-offset.y * zoom}
        height={plotCanvas.height * zoom}
        width={guideSize}
        fill={guideFill}
      />
      {verticalTicks.map((tick) => {
        const y = -offset.y * zoom + info.meterInPx * zoom * tick;

        if (y < 0 || y > canvas.height) {
          return null;
        }

        return (
          <g key={tick}>
            <line x1="15" y1={y} x2="20" y2={y} stroke={Colors.GRAY1} />
            <text
              x={-y}
              y={11}
              fill={Colors.GRAY1}
              textAnchor="middle"
              style={{ fontSize: '11px' }}
              transform={'rotate(270)'}
            >
              {tick}
            </text>
          </g>
        );
      })}
      <rect width={canvas.width} height={guideSize} fill={guideFill} />
      <rect
        x={-offset.x * zoom}
        width={plotCanvas.width * zoom}
        height={guideSize}
        fill={guideFill}
      />
      {horizontalTicks.map((tick: number) => {
        const x = -offset.x * zoom + info.meterInPx * zoom * tick;

        if (x < 0 || x > canvas.width) {
          return null;
        }

        return (
          <g key={tick}>
            <line x1={x} y1={15} x2={x} y2={20} stroke={Colors.GRAY1} />
            <text
              x={x}
              y={11}
              fill={Colors.GRAY1}
              textAnchor="middle"
              style={{ fontSize: '11px' }}
            >
              {tick}
            </text>
          </g>
        );
      })}
    </g>
  );
};
