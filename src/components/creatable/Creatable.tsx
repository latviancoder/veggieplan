import { useAtom } from 'jotai';

import { creatableAtom } from 'atoms';
import { isRectangular } from 'utils/utils';

import { Rectangle } from '../shapes/Rectangle';

type Props = {};

export const Creatable = (props: Props) => {
  const [creatable] = useAtom(creatableAtom);

  if (!creatable) {
    return null;
  }

  if (isRectangular(creatable)) {
    return <Rectangle {...creatable} isInteracted={true} isSelected={true} />;
  }

  return null;
};
