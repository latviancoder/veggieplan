import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './Table.scss';

import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useAtomValue } from 'jotai/utils';
import { filter } from 'lodash';
import { useEffect, useRef, useState } from 'react';
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

const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
};

const columnDefs: ColDef[] = [
  {
    filter: true,
    headerName: 'Pflanze',
    minWidth: 250,
    valueGetter: ({ data }: { data: Row }) => {
      let cell = data.plantName;

      if (data.varietyName) {
        cell += ` (${data.varietyName})`;
      }

      return cell;
    },
  },
  {
    headerName: 'Beet',
    width: 90,
    filter: true,
    valueGetter: ({ data }: { data: Row }) => {
      return data.bedName || '';
    },
  },
  {
    headerName: 'Anzahl',
    width: 90,
    sortable: false,
    valueGetter: ({ data }: { data: Row }) => {
      return `${data.rows * data.inRow}`;
    },
  },
  {
    headerName: 'Abstand',
    width: 100,
    sortable: false,
    valueGetter: ({ data }: { data: Row }) => {
      return `${data.inRowSpacing}x${data.rowSpacing}`;
    },
  },
];

type Row = Plant & {
  plantName: string;
  varietyName?: string;
  bedId?: string;
  bedName?: string;
  inRow: number;
  rows: number;
};

const Table = () => {
  const { getPlantDetails, getPlantAmount } = useUtils();

  const { data: varieties } = useQuery<Variety[]>('varieties', () =>
    fetch(`/api/varieties`).then((res) => res.json())
  );

  const tableRows: Row[] = [];

  const objects = useAtomValue(objectsInMetersAtom);

  const shapeObjects = objects.filter(isRectangleShape);
  const plantObjects = objects.filter(isPlant);

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

    tableRows.push(row);
  });

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

  return (
    <div style={{ padding: '20px', flex: '1' }}>
      <div ref={container} style={{ height: '100%' }}>
        {size?.height && (
          <div
            className="ag-theme-alpine"
            style={{ height: size.height, width: size.width }}
          >
            <AgGridReact
              rowData={tableRows}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
