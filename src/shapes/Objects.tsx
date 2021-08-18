import React from 'react';
import { useAtom } from 'jotai';
import { ObjectTypes, ShapeTypes } from '../types';
import { Rectangle } from './Rectangle';
import { hoveredAtom } from '../atoms/hoveredAtom';
import { selectionAtom } from '../atoms/selectionAtom';
import { useAtomValue } from 'jotai/utils';
import { objectsAtom } from '../atoms/objectsAtom';
import { isRectangle } from '../utils';

export const Objects = () => {
  const hoveredObject = useAtomValue(hoveredAtom);
  const [selection] = useAtom(selectionAtom);
  const [objects] = useAtom(objectsAtom);

  return (
    <>
      {objects.map((obj) => {
        if (isRectangle(obj)) {
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
