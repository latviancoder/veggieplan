import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { zoomAtom } from './atoms/zoomAtom';
import { snapLinesAtom } from './atoms/snapLines';

export const SnapLines = () => {
  const zoom = useAtomValue(zoomAtom);
  const snapLines = useAtomValue(snapLinesAtom);

  if (!snapLines.length) return null;

  let verticalLines = snapLines.filter(
    ({ direction }) => direction === 'vertical'
  );

  verticalLines = verticalLines.filter(
    ({ distance }) =>
      Math.abs(distance) ===
      Math.min(...verticalLines.map(({ distance }) => Math.abs(distance)))
  );

  let horizontalLines = snapLines.filter(
    ({ direction }) => direction === 'horizontal'
  );

  horizontalLines = horizontalLines.filter(
    ({ distance }) =>
      Math.abs(distance) ===
      Math.min(...horizontalLines.map(({ distance }) => Math.abs(distance)))
  );

  return (
    <>
      {verticalLines.map(({ pointFrom, pointTo }, i) => (
        <line
          key={`vertical-${i}`}
          x1={0}
          y1={pointFrom.y}
          x2={999999}
          y2={pointTo.y}
          stroke="blue"
          strokeWidth={1 / zoom}
          shapeRendering="crispEdges"
        />
      ))}
      {horizontalLines.map(({ pointFrom, pointTo }, i) => (
        <line
          key={`horizontal-${i}`}
          x1={pointFrom.x}
          y1={0}
          x2={pointTo.x}
          y2={999999}
          stroke="blue"
          strokeWidth={1 / zoom}
          shapeRendering="crispEdges"
        />
      ))}
    </>
  );
};
