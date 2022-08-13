import { useAtomValue } from 'jotai/utils';

import { snapLinesAtom, zoomAtom } from 'atoms';

export const SnapLines = () => {
  const zoom = useAtomValue(zoomAtom);
  const snapLines = useAtomValue(snapLinesAtom);

  if (!snapLines.length) return null;

  return (
    <>
      {snapLines
        .filter(({ direction }) => direction === 'vertical')
        .map(({ point }, i) => (
          <line
            key={`vertical-${i}`}
            x1={0}
            y1={point.y}
            x2={999999}
            y2={point.y}
            stroke="#8a9fe3"
            strokeWidth={1 / zoom}
            shapeRendering="crispEdges"
          />
        ))}
      {snapLines
        .filter(({ direction }) => direction === 'horizontal')
        .map(({ point }, i) => (
          <line
            key={`horizontal-${i}`}
            x1={point.x}
            y1={0}
            x2={point.x}
            y2={999999}
            stroke="#8a9fe3"
            strokeWidth={1 / zoom}
            shapeRendering="crispEdges"
          />
        ))}
    </>
  );
};
