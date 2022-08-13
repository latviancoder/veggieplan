import { useAtomValue } from 'jotai/utils';

import {
  hiddenObjectIdsAtom,
  hoveredAtom,
  objectsAtom,
  panStartAtom,
  selectedObjectIdsAtom,
  zoomAtom,
} from 'atoms';

import { isPlant, isRectangular, useUtils } from '../../utils/utils';
import { Rectangle } from './Rectangle';

export const Objects = () => {
  const { getPlantDetails, meterToPx } = useUtils();
  const hoveredObjectId = useAtomValue(hoveredAtom);
  const selectedObjectIds = useAtomValue(selectedObjectIdsAtom);
  const objects = useAtomValue(objectsAtom);
  const panStart = useAtomValue(panStartAtom);
  const zoom = useAtomValue(zoomAtom);
  const hiddenObjectIds = useAtomValue(hiddenObjectIdsAtom);

  return (
    <>
      {objects.map((obj) => {
        if (isRectangular(obj)) {
          const plant = isPlant(obj) ? getPlantDetails(obj) : undefined;

          return (
            <Rectangle
              key={obj.id}
              {...obj}
              isHidden={hiddenObjectIds?.includes(obj.id)}
              isSelected={selectedObjectIds.includes(obj.id)}
              isHovered={obj.id === hoveredObjectId}
              isInteracted={obj.id === panStart?.interactableObjectId}
              borderRadius={plant ? meterToPx(plant.spacing / 100) / zoom : 0}
              code={plant?.code}
              hasPicture={plant?.hasPicture}
            />
          );
        }

        return null;
      })}
    </>
  );
};
