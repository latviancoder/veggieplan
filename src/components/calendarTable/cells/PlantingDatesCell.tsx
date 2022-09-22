import { Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import { Month, PlantDatesBar } from 'components/plantDatesBar/PlantDatesBar';
import { useFormatDate } from 'hooks/useFormatDate';

import { Row } from '../CalendarTable';
import styles from '../CalendarTable.module.scss';

export const PlantingDatesCell = ({
  data: {
    dateStartIndoors,
    dateTransplant,
    dateDirectSow,
    dateFirstHarvest,
    dateLastHarvest,
  },
  months,
}: {
  data: Row;
  months: Month[];
}) => {
  const formatDate = useFormatDate();

  return (
    <Tooltip2
      content={
        <div className={styles.dateTooltip}>
          {dateStartIndoors && (
            <div className={styles.dateTooltipRow}>
              <span>Voranzucht:</span>{' '}
              <strong>{formatDate(dateStartIndoors, 'PPP')}</strong>
            </div>
          )}
          {dateTransplant && (
            <div className={styles.dateTooltipRow}>
              <span>Auspflanzen:</span>{' '}
              <strong>{formatDate(dateTransplant, 'PPP')}</strong>
            </div>
          )}
          {dateDirectSow && (
            <div className={styles.dateTooltipRow}>
              <span>Aussaat ins Freiland:</span>{' '}
              <strong>{formatDate(dateDirectSow, 'PPP')}</strong>
            </div>
          )}
          {dateFirstHarvest && (
            <div className={styles.dateTooltipRow}>
              <span>Erste Ernte:</span>{' '}
              <strong>{formatDate(dateFirstHarvest, 'PPP')}</strong>
            </div>
          )}
          {dateLastHarvest && (
            <div className={styles.dateTooltipRow}>
              <span>Letze Ernte:</span>{' '}
              <strong>{formatDate(dateLastHarvest, 'PPP')}</strong>
            </div>
          )}
        </div>
      }
      position={Position.LEFT}
    >
      <div className={styles.plantDates}>
        <PlantDatesBar
          dateStartIndoors={dateStartIndoors}
          dateTransplant={dateTransplant}
          dateDirectSow={dateDirectSow}
          dateFirstHarvest={dateFirstHarvest}
          dateLastHarvest={dateLastHarvest}
          months={months}
          showMonthTitle={false}
          barHeight={6}
        />
      </div>
    </Tooltip2>
  );
};
