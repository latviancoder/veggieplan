import { useAtom } from 'jotai';
import { useAtomDevtools } from 'jotai/devtools';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import { lazy, Suspense, useEffect } from 'react';
import { useQuery } from 'react-query';

import {
  canvasAtom,
  plantsAtom,
  plotCanvasAtom,
  viewAtom,
} from '../../atoms/atoms';
import { objectsAtom } from '../../atoms/objectsAtom';
import { GardenObject, PlantDetails, Views } from '../../types';
import { useUtils } from '../../utils/utils';
import { DetailsBarConnected } from '../detailsBar/DetailsBar';
import { DrawableArea } from '../drawableArea/DrawableArea';
import { GlobalHeader } from '../header/GlobalHeader';
import { MonthsSelectorContainer } from '../monthsSelector/MonthsSelector';
import { SidebarLeft } from '../sidebarLeft/SidebarLeft';
import styles from './Root.module.css';

const Table = lazy(() => import('../table/Table'));

const Root = () => {
  // useAutosave();

  const { meterToPx } = useUtils();

  const view = useAtomValue(viewAtom);
  const canvas = useAtomValue(canvasAtom);
  const plotCanvas = useAtomValue(plotCanvasAtom);
  const setPlants = useUpdateAtom(plantsAtom);
  const [objects, setObjects] = useAtom(objectsAtom);

  useAtomDevtools(objectsAtom);

  const { data: plantsDetails } = useQuery<PlantDetails[]>('plants', () =>
    fetch('/api/plants').then((res) => res.json())
  );

  const { data: objectsFromDb } = useQuery<GardenObject[]>('objects', () =>
    fetch('/api/objects').then((res) => res.json())
  );

  useEffect(() => {
    if (objectsFromDb && isEmpty(objects) && !isEmpty(objectsFromDb)) {
      // When store is initially hydrated with objects from the DB we skip 'pixels-to-meters' conversion step,
      // because objects stored in DB already use meters.
      setObjects({
        type: 'replaceAll',
        payload: objectsFromDb,
        units: 'meters',
      });
    }
  }, [objectsFromDb, plotCanvas, canvas, setObjects, meterToPx, objects]);

  useEffect(() => {
    if (plantsDetails) setPlants(plantsDetails);
  }, [plantsDetails, setPlants]);

  return (
    <div className={styles.root}>
      <GlobalHeader />
      <div className={styles.content}>
        {view === Views.PLAN && (
          <>
            <SidebarLeft />
            <div
              style={{
                position: 'relative',
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <DrawableArea />
              <MonthsSelectorContainer />
            </div>
            <DetailsBarConnected />
          </>
        )}
        {view === Views.TABLE && (
          <Suspense fallback="Tabelle wird geladen..">
            <Table />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Root;
