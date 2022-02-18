import { Tooltip, Position } from '@blueprintjs/core';
import { Month, PlantDatesBar } from 'components/plantDatesBar/PlantDatesBar';
import { formatDate } from 'utils';
import { Row } from '../Table';
import styles from '../Table.module.scss';

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
  return (
    <Tooltip
      content={
        <div className={styles.dateTooltip}>
          {dateStartIndoors && (
            <div className={styles.dateTooltipRow}>
              <span>Voranzucht:</span>{' '}
              <strong>{formatDate(dateStartIndoors, 'd MMM')}</strong>
            </div>
          )}
          {dateTransplant && (
            <div className={styles.dateTooltipRow}>
              <span>Auspflanzen:</span>{' '}
              <strong>{formatDate(dateTransplant, 'd MMM')}</strong>
            </div>
          )}
          {dateDirectSow && (
            <div className={styles.dateTooltipRow}>
              <span>Aussaat ins Freiland:</span>{' '}
              <strong>{formatDate(dateDirectSow, 'd MMM')}</strong>
            </div>
          )}
          {dateFirstHarvest && (
            <div className={styles.dateTooltipRow}>
              <span>Erste Ernte:</span>{' '}
              <strong>{formatDate(dateFirstHarvest, 'd MMM')}</strong>
            </div>
          )}
          {dateLastHarvest && (
            <div className={styles.dateTooltipRow}>
              <span>Letze Ernte:</span>{' '}
              <strong>{formatDate(dateLastHarvest, 'd MMM')}</strong>
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
    </Tooltip>
  );
};
