import React from 'react';
import { useAtom } from 'jotai';
import { ObjectTypes, ShapeTypes } from '../types';
import { Rectangle } from './Rectangle';
import { hoveredAtom } from '../atoms/hoveredAtom';
import { selectionAtom } from '../atoms/selectionAtom';
import { useAtomValue } from 'jotai/utils';
import { objectsAtom } from '../atoms/objectsAtom';

export const Objects = () => {
  const hoveredObject = useAtomValue(hoveredAtom);
  const [selection] = useAtom(selectionAtom);
  const [objects] = useAtom(objectsAtom);

  return (
    <>
      {objects.map((obj) => {
        if (
          obj.objectType === ObjectTypes.Shape &&
          obj.shapeType === ShapeTypes.Rectangle
        ) {
          return (
            <Rectangle
              key={obj.id}
              {...obj}
              isSelected={selection.includes(obj.id)}
              isHovered={obj.id === hoveredObject}
            />
          );
        }

        return null;
      })}
    </>
  );
};
