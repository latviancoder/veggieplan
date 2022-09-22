import { Classes, Colors } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';

import { Plant } from 'types';

import { useUtils } from '../../utils/utils';

export const PlantAmountRow = ({ obj }: { obj: Plant }) => {
  const { t } = useTranslation();
  const { getPlantAmount } = useUtils();

  const { inRow, rows } = getPlantAmount(obj);

  return (
    <>
      <div>
        <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
          {t('Plants')}
        </h6>
        {rows * inRow}
      </div>
      <div>
        <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
          {t('Rows')}
        </h6>
        {rows}x{inRow}
      </div>
    </>
  );
};
