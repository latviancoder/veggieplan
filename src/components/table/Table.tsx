import './Table.scss';

import {
  Column,
  Table2,
  Cell,
  ICellProps,
  SelectionModes,
} from '@blueprintjs/table';

import { Month, PlantDatesBar } from 'components/plantDatesBar/PlantDatesBar';
import {
  addMonths,
  differenceInMonths,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { useAtomValue } from 'jotai/utils';
import { compact, max, min, sortBy } from 'lodash';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';

import { Position, Tooltip } from '@blueprintjs/core';

import { objectsInMetersAtom } from '../../atoms/objectsAtom';
import { Plant, Variety } from '../../types';
import {
  convertRectangleToPolygon,
  doPolygonsIntersect,
  formatDate,
  isPlant,
  isRectangleShape,
  isRectangular,
  useUtils,
} from '../../utils/utils';
import { NotesCell } from './cells/NotesCell';
import styles from './Table.module.scss';
import { CustomCell } from './cells/CustomCell';
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

const fetchVarieties = () => fetch(`/api/varieties`).then((res) => res.json());

export const useFetchVarieties = (options?: UseQueryOptions<Variety[]>) => {
  return useQuery<Variety[]>('varieties', fetchVarieties, options);
};

const Table = () => {
  const { getPlantDetails, getPlantAmount } = useUtils();

  const { data: varieties } = useFetchVarieties();

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

  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (container.current) {
      const rect = container.current.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [setSize]);

  const months: Month[] = useMemo(() => {
    const dates = tableRows.map(
      ({
        dateStartIndoors,
        dateTransplant,
        dateDirectSow,
        dateFirstHarvest,
        dateLastHarvest,
      }) => {
        const si = dateStartIndoors ? new Date(dateStartIndoors) : undefined;
        const tp = dateTransplant ? new Date(dateTransplant) : undefined;
        const ds = dateDirectSow ? new Date(dateDirectSow) : undefined;
        const fh = dateFirstHarvest ? new Date(dateFirstHarvest) : undefined;
        const lh = dateLastHarvest ? new Date(dateLastHarvest) : undefined;

        const earliestDate = min(compact([si, tp, ds]));
        const latestDate = max(compact([fh, lh]));

        return { earliestDate, latestDate };
      }
    );

    const earliestDate = min(dates.map(({ earliestDate }) => earliestDate));
    const latestDate = max(dates.map(({ latestDate }) => latestDate));

    if (latestDate && earliestDate) {
      const monthsCount = differenceInMonths(latestDate, earliestDate);

      return [...Array(monthsCount + 1).keys()].map((i) => ({
        title: format(addMonths(earliestDate, i), 'MMM', { locale: de }),
        start: startOfMonth(addMonths(earliestDate, i)),
        end: endOfMonth(addMonths(earliestDate, i)),
      }));
    }

    return [];
  }, [tableRows]);

  return (
    <div style={{ padding: '20px', flex: '1' }}>
      <div ref={container} style={{ height: '100%' }}>
        {size?.height && (
          <Table2
            enableRowHeader={false}
            numRows={tableRows.length}
            rowHeights={[40, 40]}
            columnWidths={[
              size.width * 0.2,
              size.width * 0.06,
              size.width * 0.06,
              size.width * 0.5,
              size.width * 0.18,
            ]}
          >
            <Column
              name="Pflanze"
              cellRenderer={(i) => {
                const data = tableRows[i];

                let cell = data.plantName;

                if (data.varietyName) {
                  cell += ` (${data.varietyName})`;
                }

                return <CustomCell>{cell}</CustomCell>;
              }}
            />
            <Column
              name="Beet"
              cellRenderer={(i) => (
                <CustomCell>{tableRows[i].bedName || ''}</CustomCell>
              )}
            />
            <Column
              name="Abstand"
              cellRenderer={(i) => {
                const data = tableRows[i];
                return (
                  <CustomCell>{`${data.inRowSpacing}x${data.rowSpacing}`}</CustomCell>
                );
              }}
            />
            <Column
              nameRenderer={() => (
                <div className={styles.header}>
                  {months.map(({ title }, i) => (
                    <div className={styles.month} key={i}>
                      {title}
                    </div>
                  ))}
                </div>
              )}
              cellRenderer={(i) => (
                <CustomCell>
                  <PlantingDatesCell months={months} data={tableRows[i]} />
                </CustomCell>
              )}
            />
            <Column
              name="Notizen"
              cellRenderer={(i) => (
                <CustomCell>
                  <NotesCell data={tableRows[i]} />
                </CustomCell>
              )}
            />
          </Table2>
        )}
      </div>
    </div>
  );
};

export default Table;
