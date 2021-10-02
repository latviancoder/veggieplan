import { useAtomValue } from 'jotai/utils';

import {
  modeAtom,
  mousePositionAtom,
  offsetAtom,
  selectedPlantAtom,
} from './atoms/atoms';
import { panStartAtom } from './atoms/panStartAtom';
import { zoomAtom } from './atoms/zoomAtom';
import { getPlant, useConversionHelpers } from './utils';

export const PlantUnderCursor = () => {
  const { meterToPx, absoluteToRelativeX, absoluteToRelativeY } =
    useConversionHelpers();
  const selectedPlant = useAtomValue(selectedPlantAtom);
  const mousePosition = useAtomValue(mousePositionAtom);
  const mode = useAtomValue(modeAtom);
  const panStart = useAtomValue(panStartAtom);

  if (!selectedPlant || !mousePosition || panStart) return null;

  const plant = getPlant(selectedPlant);

  const spacingInPixels = meterToPx(plant.spacing / 100);

  return (
    <rect
      x={absoluteToRelativeX(mousePosition.x) - spacingInPixels}
      y={absoluteToRelativeY(mousePosition.y) - spacingInPixels}
      width={spacingInPixels}
      height={spacingInPixels}
      fill="red"
    />
  );
};
