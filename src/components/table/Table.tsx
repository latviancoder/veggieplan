import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './Table.scss';

import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Month, PlantDatesBar } from 'components/plantDatesBar/PlantDatesBar';
import {
  addMonths,
  differenceInMonths,
  endOfMonth,
  format,
  startOfMonth
} from 'date-fns';
import { useAtomValue } from 'jotai/utils';
import { compact, max, min } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import { objectsInMetersAtom } from '../../atoms/objectsAtom';
import { Plant, Variety } from '../../types';
import {
  convertRectangleToPolygon,
  doPolygonsIntersect,
  isPlant,
  isRectangleShape,
  isRectangular,
  useUtils
} from '../../utils';
import styles from './Table.module.scss';

const defaultColDef: ColDef = {
  resizable: false,
  sortable: true,
};

type Row = Plant & {
  plantName: string;
  varietyName?: string;
  bedId?: string;
  bedName?: string;
  inRow: number;
  rows: number;
};

const Table = () => {
  const [gridApi, setApi] = useState<GridApi | null>(null);
  const { getPlantDetails, getPlantAmount } = useUtils();

  const { data: varieties } = useQuery<Variety[]>('varieties', () =>
    fetch(`/api/varieties`).then((res) => res.json())
  );

  const objects = useAtomValue(objectsInMetersAtom);

  const shapeObjects = objects.filter(isRectangleShape);
  const plantObjects = objects.filter(isPlant);

  const tableRows = useMemo(() => {
    const r: Row[] = [];

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
        title: format(addMonths(earliestDate, i), 'MMM'),
        start: startOfMonth(addMonths(earliestDate, i)),
        end: endOfMonth(addMonths(earliestDate, i)),
      }));
    }

    return [];
  }, [tableRows]);

  const onGridReady = ({ api }: GridReadyEvent) => {
    setApi(api);
  };

  useEffect(() => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
  }, [gridApi]);

  const PlantingDatesRenderer = ({ data }: { data: Row }) => {
    return (
      <div className={styles.plantDates}>
        <PlantDatesBar
          dateStartIndoors={data.dateStartIndoors}
          dateTransplant={data.dateTransplant}
          dateDirectSow={data.dateDirectSow}
          dateFirstHarvest={data.dateFirstHarvest}
          dateLastHarvest={data.dateLastHarvest}
          months={months}
          showMonthTitle={false}
          barHeight={6}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', flex: '1' }}>
      <div ref={container} style={{ height: '100%' }}>
        {size?.height && (
          <div
            className="ag-theme-alpine"
            style={{ height: size.height, width: size.width }}
          >
            <AgGridReact
              onGridReady={onGridReady}
              rowData={tableRows}
              defaultColDef={defaultColDef}
              frameworkComponents={{
                plantingDatesRenderer: PlantingDatesRenderer,
              }}
            >
              <AgGridColumn
                filter
                headerName="Pflanze"
                width={size.width * 0.2}
                valueGetter={({ data }) => {
                  let cell = data.plantName;

                  if (data.varietyName) {
                    cell += ` (${data.varietyName})`;
                  }

                  return cell;
                }}
              />
              <AgGridColumn
                suppressSizeToFit
                filter
                headerName="Beet"
                width={size.width * 0.07}
                minWidth={80}
                valueGetter={({ data }) => data.bedName || ''}
              />
              <AgGridColumn
                suppressSizeToFit
                headerName="Anzahl"
                width={size.width * 0.07}
                minWidth={80}
                sortable={false}
                valueGetter={({ data }) => `${data.rows * data.inRow}`}
              />
              <AgGridColumn
                suppressSizeToFit
                headerName="Abstand"
                width={size.width * 0.07}
                minWidth={80}
                sortable={false}
                valueGetter={({ data }) =>
                  `${data.inRowSpacing}x${data.rowSpacing}`
                }
              />
              <AgGridColumn
                sortable={false}
                width={size.width * 0.59 - 2}
                cellRenderer="plantingDatesRenderer"
                headerComponentFramework={() => (
                  <div className={styles.header}>
                    {months.map(({ title }) => (
                      <div className={styles.month} key={title}>
                        {title}
                      </div>
                    ))}
                  </div>
                )}
              />
            </AgGridReact>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
