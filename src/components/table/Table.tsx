import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './Table.scss';

import { AgGridReact } from 'ag-grid-react';
import { useAtomValue } from 'jotai/utils';
import { useEffect, useRef, useState } from 'react';

import { objectsAtom } from '../../atoms/objectsAtom';

const columnDefs = [
  {
    headerName: 'Make',
    field: 'make',
    filter: true,
    resizable: true,
  },
  {
    headerName: 'Model',
    field: 'model',
    filter: true,
    resizable: true,
    flex: 1,
  },
  {
    headerName: 'Price',
    field: 'price',
    filter: true,
    resizable: true,
  },
];

const Table = () => {
  // Canvas doesn't exist on this page.
  // The x/y/width/height values aren't converted to pixels
  const objects = useAtomValue(objectsAtom);

  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  const container = useRef<HTMLDivElement | null>(null);

  const rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
  ];

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
            <AgGridReact rowData={rowData} columnDefs={columnDefs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
