import React from 'react';
import { useAtom } from 'jotai';
import { creatableAtom } from './atoms/atoms';
import { ObjectTypes, ShapeTypes } from './types';
import { Rectangle } from './shapes/Rectangle';

type Props = {};

export const Creatable = (props: Props) => {
  const [creatable] = useAtom(creatableAtom);

  if (!creatable) {
    return null;
  }

  if (
    creatable.objectType === ObjectTypes.Shape &&
    creatable.shapeType === ShapeTypes.Rectangle
  ) {
    return <Rectangle {...creatable} isHighlighted={true} isSelected={true} />;
  }

  return null;
};
