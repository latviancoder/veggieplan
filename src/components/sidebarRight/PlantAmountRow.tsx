import { Classes, Colors } from '@blueprintjs/core';

import { Plant } from 'types';

import { useUtils } from '../../utils/utils';

export const PlantAmountRow = ({ obj }: { obj: Plant }) => {
  const { getPlantAmount } = useUtils();

  const { inRow, rows } = getPlantAmount(obj);

  return (
    <>
      <div>
        <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
          Pflanzen
        </h6>
        {rows * inRow}
      </div>
      <div>
        <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
          Reihen
        </h6>
        {rows}x{inRow}
      </div>
    </>
  );
};
