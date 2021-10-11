import { Rectangle } from './Rectangle';
import { hoveredAtom } from '../../atoms/hoveredAtom';
import { selectedObjectIdsAtom } from '../../atoms/selectedObjectIdsAtom';
import { useAtomValue } from 'jotai/utils';
import { objectsAtom } from '../../atoms/objectsAtom';
import { isRectangular, useUtils } from '../../utils';
import { panStartAtom } from '../../atoms/panStartAtom';
import { ObjectTypes } from '../../types';
import { zoomAtom } from '../../atoms/zoomAtom';

export const Objects = () => {
  const { getPlant, meterToPx } = useUtils();
  const hoveredObjectId = useAtomValue(hoveredAtom);
  const selection = useAtomValue(selectedObjectIdsAtom);
  const objects = useAtomValue(objectsAtom);
  const panStart = useAtomValue(panStartAtom);
  const zoom = useAtomValue(zoomAtom);

  // console.log({ objects });

  return (
    <>
      {objects.map((obj) => {
        if (isRectangular(obj)) {
          const plant =
            obj.objectType === ObjectTypes.Plant && obj.plantId
              ? getPlant(obj.plantId)
              : undefined;

          return (
            <Rectangle
              key={obj.id}
              {...obj}
              isSelected={selection.includes(obj.id)}
              isHovered={obj.id === hoveredObjectId}
              isInteracted={obj.id === panStart?.interactableObjectId}
              borderRadius={plant ? meterToPx(plant.spacing / 100) / zoom : 0}
            />
          );
        }

        return null;
      })}
    </>
  );
};
