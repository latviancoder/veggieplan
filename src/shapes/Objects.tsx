import { useAtom } from 'jotai';
import { ObjectTypes, ShapeTypes } from '../types';
import { Rectangle } from './Rectangle';
import { hoveredAtom } from '../atoms/hoveredAtom';
import { selectionAtom } from '../atoms/selectionAtom';
import { useAtomValue } from 'jotai/utils';
import { objectsAtom } from '../atoms/objectsAtom';
import { isRectangular } from '../utils';
import { panStartAtom } from '../atoms/panStartAtom';

export const Objects = () => {
  const hoveredObjectId = useAtomValue(hoveredAtom);
  const selection = useAtomValue(selectionAtom);
  const objects = useAtomValue(objectsAtom);
  const panStart = useAtomValue(panStartAtom);

  return (
    <>
      {objects.map((obj) => {
        if (isRectangular(obj)) {
          return (
            <Rectangle
              key={obj.id}
              {...obj}
              isSelected={selection.includes(obj.id)}
              isHovered={obj.id === hoveredObjectId}
              isInteracted={obj.id === panStart?.interactableObjectId}
            />
          );
        }

        return null;
      })}
    </>
  );
};
