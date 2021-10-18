import { Classes, Colors } from '@blueprintjs/core';

import { PlantDetails } from '../../types';
import { useUtils } from '../../utils';
import styles from './DetailsBar.module.scss';

export const PlantAmountRow = ({
  plant,
  width,
  height,
}: {
  plant: PlantDetails;
  width: number;
  height: number;
}) => {
  const { getPlantAmount } = useUtils();

  const { inRow, rows } = getPlantAmount({
    plant,
    width: width,
    height: height,
  });

  return (
    <div className={styles.threeColumns}>
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
    </div>
  );
};
