import React from 'react';
import { useAtom } from 'jotai';
import { creatableAtom } from './atoms/atoms';
import { ObjectTypes, ShapeTypes } from './types';
import { Rectangle } from './shapes/Rectangle';
import { isRectangle } from './utils';

type Props = {};

export const Creatable = (props: Props) => {
  const [creatable] = useAtom(creatableAtom);

  if (!creatable) {
    return null;
  }

  if (isRectangle(creatable)) {
    return <Rectangle {...creatable} isHighlighted={true} isSelected={true} />;
  }

  return null;
};
