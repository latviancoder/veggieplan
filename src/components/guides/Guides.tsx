import { useAtom } from 'jotai';
import {
  canvasAtom,
  offsetAtom,
  plotAtom,
  plotCanvasAtom,
} from '../../atoms/atoms';
import { scaleLinear } from 'd3-scale';
import { zoomAtom } from '../../atoms/zoomAtom';
import { infoAtom } from '../../atoms/infoAtom';

type Props = {};

export const Guides = (props: Props) => {
  const [offset] = useAtom(offsetAtom);
  const [info] = useAtom(infoAtom);
  const [zoom] = useAtom(zoomAtom);
  const [plot] = useAtom(plotAtom);
  const [plotCanvas] = useAtom(plotCanvasAtom);
  const [canvas] = useAtom(canvasAtom);

  const guideSize = 20;

  if (!info) {
    return null;
  }

  const calculateTicks = (
    plotCanvasSize: number,
    canvasSize: number,
    plotSize: number
  ) => {
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
  };

  const horizontalTicks = calculateTicks(
    plotCanvas.width,
    canvas.width,
    plot.width
  );

  const verticalTicks = calculateTicks(
    plotCanvas.height,
    canvas.height,
    plot.height
  );

  return (
    <g transform={`translate(${offset.x} ${offset.y}) scale(${1 / zoom})`}>
      <rect width={canvas.width} height={guideSize} fill="#fff" />
      <rect
        x={-offset.x * zoom}
        width={plotCanvas.width * zoom}
        height={guideSize}
        fill="none"
      />
      {horizontalTicks.map((tick: number) => {
        const x = -offset.x * zoom + info.meterInPx * zoom * tick;

        if (x < 0 || x > canvas.width) {
          return null;
        }

        return (
          <g key={tick}>
            <line x1={x} y1="0" x2={x} y2={5} stroke="#333" />
            <text
              x={x}
              y={16}
              fill="#333"
              textAnchor="middle"
              style={{ fontSize: '10px' }}
            >
              {tick}
            </text>
          </g>
        );
      })}
      <rect width={guideSize} height={canvas.height} fill="#fff" />
      <rect
        y={-offset.y * zoom}
        height={plotCanvas.height * zoom}
        width={guideSize}
        fill="none"
      />
      {verticalTicks.map((tick) => {
        const y = -offset.y * zoom + info.meterInPx * zoom * tick;

        if (y < 0 || y > canvas.height) {
          return null;
        }

        return (
          <g key={tick}>
            <line x1="0" y1={y} x2="5" y2={y} stroke="#333" />
            <text
              x={-y}
              y={16}
              fill="#333"
              textAnchor="middle"
              style={{ fontSize: '10px' }}
              transform={'rotate(270)'}
            >
              {tick}
            </text>
          </g>
        );
      })}
    </g>
  );
};
