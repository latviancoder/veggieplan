import { useAtomValue } from 'jotai/utils';

import { mousePositionAtom, selectedPlantAtom } from '../atoms/atoms';
import { panStartAtom } from '../atoms/panStartAtom';
import { useUtils } from '../utils/utils';

export const PlantUnderCursor = () => {
  // const { meterToPx, absoluteToRelativeX, absoluteToRelativeY, getPlantDetails } =
  //   useUtils();
  // const selectedPlant = useAtomValue(selectedPlantAtom);
  // const mousePosition = useAtomValue(mousePositionAtom);
  // const panStart = useAtomValue(panStartAtom);
  // if (!selectedPlant || !mousePosition || panStart) return null;
  // const plant = getPlantDetails(selectedPlant);
  // const spacingInPixels = meterToPx(plant.spacing / 100);
  // return (
  //   <rect
  //     x={absoluteToRelativeX(mousePosition.x) - spacingInPixels}
  //     y={absoluteToRelativeY(mousePosition.y) - spacingInPixels}
  //     width={spacingInPixels}
  //     height={spacingInPixels}
  //     fill="red"
  //   />
  // );
};
