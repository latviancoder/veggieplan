import { useAtomValue } from 'jotai/utils';
import { selectionAtom } from '../../atoms/selectionAtom';
import { zoomAtom } from '../../atoms/zoomAtom';

export const SelectionArea = () => {
  const selection = useAtomValue(selectionAtom);
  const zoom = useAtomValue(zoomAtom);

  if (!selection) return null;

  const { x, y, width, height } = selection;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="none"
      stroke="#333"
      strokeDasharray={4 / zoom}
      strokeWidth={1 / zoom}
    />
  );
};
