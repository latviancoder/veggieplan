import {
  addMonths,
  differenceInCalendarDays,
  differenceInMonths,
  endOfMonth,
  format,
  getDaysInMonth,
  isEqual,
  isWithinInterval,
  max,
  min,
  startOfMonth
} from 'date-fns';
import { de } from 'date-fns/locale';
import compact from 'lodash.compact';

import { Colors } from '@blueprintjs/core';

import styles from './PlantDatesBar.module.scss';

export type Month = {
  title: string;
  start: Date;
  end: Date;
};

type Props = {
  dateStartIndoors?: string;
  dateTransplant?: string;
  dateDirectSow?: string;
  dateFirstHarvest?: string;
  dateLastHarvest?: string;
  months?: Month[];
  showMonthTitle: boolean;
  barHeight?: number;
};

const BarColors = {
  seedStart: Colors.COBALT4,
  inBed: Colors.FOREST3,
  harvest: Colors.ORANGE3,
};

export const PlantDatesBar = ({
  dateStartIndoors,
  dateTransplant,
  dateDirectSow,
  dateFirstHarvest,
  dateLastHarvest,
  months,
  showMonthTitle,
  barHeight = 4,
}: Props) => {
  if (
    (!dateTransplant && !dateDirectSow) ||
    (!dateFirstHarvest && !dateLastHarvest)
  ) {
    return null;
  }

  const si = dateStartIndoors ? new Date(dateStartIndoors) : undefined;
  const tp = dateTransplant ? new Date(dateTransplant) : undefined;
  const ds = dateDirectSow ? new Date(dateDirectSow) : undefined;
  const fh = dateFirstHarvest ? new Date(dateFirstHarvest) : undefined;
  const lh = dateLastHarvest ? new Date(dateLastHarvest) : undefined;

  if (!months) {
    const earliestDate = min(compact([si, tp, ds]));
    const latestDate = max(compact([fh, lh]));

    const monthsCount = differenceInMonths(latestDate, earliestDate);

    months = [...Array(monthsCount + 1).keys()].map((i) => ({
      title: format(addMonths(earliestDate, i), 'MMM', { locale: de }),
      start: startOfMonth(addMonths(earliestDate, i)),
      end: endOfMonth(addMonths(earliestDate, i)),
    }));
  }

  const periods: {
    type: 'seedStart' | 'inBed' | 'harvest';
    start: Date;
    end: Date;
  }[] = [];

  if (si && tp) {
    periods.push({ type: 'seedStart', start: si, end: tp });
  }

  if ((tp || ds) && (lh || fh)) {
    // @ts-ignore
    periods.push({ type: 'inBed', start: tp || ds, end: lh || fh });
  }

  if (fh && lh) {
    periods.push({ type: 'harvest', start: fh, end: lh });
  }

  return (
    <div className={styles.root}>
      {months.map(({ title, start: monthStart, end: monthEnd }, i) => (
        <div className={styles.month} key={i}>
          {showMonthTitle && <div className={styles.monthTitle}>{title}</div>}

          {periods.map(({ type, ...period }) => {
            let monthPeriodStart: Date | undefined,
              monthPeriodEnd: Date | undefined;

            if (
              isWithinInterval(period.start, {
                start: monthStart,
                end: monthEnd,
              })
            ) {
              monthPeriodStart = period.start;
            }

            if (
              isWithinInterval(period.end, {
                start: monthStart,
                end: monthEnd,
              })
            ) {
              monthPeriodEnd = period.end;
            }

            if (
              !monthPeriodStart &&
              !monthPeriodEnd &&
              isWithinInterval(monthStart, {
                start: period.start,
                end: period.end,
              }) &&
              isWithinInterval(monthEnd, {
                start: period.start,
                end: period.end,
              })
            ) {
              monthPeriodStart = monthStart;
              monthPeriodEnd = monthEnd;
            }

            if (monthPeriodStart && !monthPeriodEnd) {
              monthPeriodEnd = monthEnd;
            }

            if (!monthPeriodStart && monthPeriodEnd) {
              monthPeriodStart = monthStart;
            }

            if (monthPeriodStart && monthPeriodEnd) {
              const diff = Math.abs(
                differenceInCalendarDays(monthPeriodStart, monthPeriodEnd)
              );

              // todo this (diff + 1) is a bad workaround for 'differenceInCalendarDays' not being 'inclusive
              const width =
                ((diff > 0 ? diff + 1 : 0) / getDaysInMonth(monthStart)) * 100;

              return (
                <div
                  key={`${title}-${type}`}
                  className={styles.barContainer}
                  style={{
                    justifyContent: isEqual(monthPeriodStart, monthStart)
                      ? 'flex-start'
                      : 'flex-end',
                  }}
                >
                  <div
                    style={{
                      height: barHeight,
                      backgroundColor: BarColors[type],
                      width: `${width}%`,
                    }}
                  />
                </div>
              );
            }

            return <div key={`${title}-${type}`} className={styles.bar} />;
          })}
        </div>
      ))}
    </div>
  );
};
