import { HTMLTable } from '@blueprintjs/core';
import {
  addMonths,
  differenceInMonths,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import { useAtomValue } from 'jotai/utils';
import { max, min, sortBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { objectsInMetersAtom, varietiesAtom } from 'atoms';
import { Month } from 'components/plantDatesBar/PlantDatesBar';
import { useFormatDate } from 'hooks/useFormatDate';
import { Plant } from 'types';

import {
  convertRectangleToPolygon,
  doPolygonsIntersect,
  getPlantName,
  getTerminalDates,
  isPlant,
  isRectangleShape,
  isRectangular,
  useUtils,
} from '../../utils/utils';
import styles from './CalendarTable.module.scss';
import { NotesCell } from './cells/NotesCell';
import { PlantingDatesCell } from './cells/PlantingDatesCell';

export type Row = Plant & {
  plantName: string;
  varietyName?: string;
  bedId?: string;
  bedName?: string;
  inRow: number;
  rows: number;
  earliestDate?: Date;
};

const CalendarTable = () => {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const varieties = useAtomValue(varietiesAtom);
  const { getPlantDetails, getPlantAmount } = useUtils();

  const objects = useAtomValue(objectsInMetersAtom);

  const shapeObjects = objects.filter(isRectangleShape);
  const plantObjects = objects.filter(isPlant);

  const tableRows = useMemo(() => {
    let r: Row[] = [];

    plantObjects.forEach((plantObject) => {
      let row: Row = { ...plantObject } as Row;

      if (plantObject.varietyId && varieties) {
        row.varietyName = varieties?.find(
          ({ id }) => id === plantObject.varietyId
        )?.name;
      }

      // Check if plant is within shape
      const inBed = shapeObjects.find((shapeObject) => {
        if (isRectangular(shapeObject)) {
          const rectanglePolygon = convertRectangleToPolygon({
            rectangle: shapeObject,
          });

          const plantPolygon = convertRectangleToPolygon({
            rectangle: plantObject,
          });

          if (doPolygonsIntersect(plantPolygon, rectanglePolygon)) {
            return true;
          }
        }

        return false;
      });

      if (inBed) {
        row.bedId = inBed.id;
        row.bedName = inBed.title;
      }

      const plantDetails = getPlantDetails(plantObject);
      const { inRow, rows } = getPlantAmount(plantObject);

      row.inRowSpacing = plantDetails.inRowSpacing;
      row.rowSpacing = plantDetails.rowSpacing;
      row.plantName = plantDetails.name;

      row.inRow = inRow;
      row.rows = rows;

      r.push(row);
    });

    r = sortBy(r, ({ earliestDate }) => earliestDate);

    return r;
  }, [getPlantAmount, getPlantDetails, plantObjects, shapeObjects, varieties]);

  const months: Month[] = useMemo(() => {
    const dates = tableRows.map(getTerminalDates);

    const earliestDate = min(dates.map(({ earliest }) => earliest));
    const latestDate = max(dates.map(({ latestHarvest }) => latestHarvest));

    if (latestDate && earliestDate) {
      const monthsCount = differenceInMonths(latestDate, earliestDate);

      return [...Array(monthsCount + 1).keys()].map((i) => ({
        title: formatDate(addMonths(earliestDate, i), 'MMM'),
        start: startOfMonth(addMonths(earliestDate, i)),
        end: endOfMonth(addMonths(earliestDate, i)),
      }));
    }

    return [];
  }, [tableRows]);

  return (
    <div style={{ padding: '15px 20px', flex: '1' }}>
      <HTMLTable
        striped
        interactive
        bordered
        style={{ width: '100%', outline: 'none' }}
      >
        <thead>
          <tr>
            <th style={{ width: '15%' }}>{t('Plant')}</th>
            <th style={{ width: '50px' }}>{t('Bed')}</th>
            <th style={{ width: '50px' }}>{t('Spacing')}</th>
            <th>
              <div className={styles.header}>
                {months.map(({ title }, i) => (
                  <div className={styles.month} key={i}>
                    {title}
                  </div>
                ))}
              </div>
            </th>
            <th style={{ width: '20%' }}>{t('Notes')}</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((data) => (
            <tr key={data.id}>
              <td style={{ whiteSpace: 'nowrap' }}>
                {getPlantName(data.plantName, data.varietyName)}
              </td>
              <td>{data.bedName || ''}</td>
              <td
                style={{ whiteSpace: 'nowrap' }}
              >{`${data.inRowSpacing}x${data.rowSpacing} cm`}</td>
              <td style={{ position: 'relative' }}>
                <PlantingDatesCell months={months} data={data} />
              </td>
              <td style={{ position: 'relative' }}>
                <NotesCell data={data} />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </div>
  );
};

export default CalendarTable;
