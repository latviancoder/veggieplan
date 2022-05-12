import { useAtom } from 'jotai';
import { useAtomDevtools } from 'jotai/devtools';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import { lazy, Suspense, useLayoutEffect, useRef } from 'react';
import { useQuery } from 'react-query';

import { plantsAtom, plotAtom, viewAtom } from '../../atoms/atoms';
import { objectsAtom } from '../../atoms/objectsAtom';
import { GardenObject, PlantDetails, Views } from '../../types';
import { SidebarRightConnected } from '../sidebarRight/SidebarRight';
import { DrawableArea } from '../drawableArea/DrawableArea';
import { GlobalHeader } from '../header/GlobalHeader';
import { MonthsSelectorContainer } from '../monthsSelector/MonthsSelector';
import { SidebarLeft } from '../sidebarLeft/SidebarLeft';
import styles from './Root.module.css';
import { useAutosave } from 'hooks/useAutoSave';

const Table = lazy(() => import('../table/Table'));

const Root = () => {
  // useAutosave();
  const hydrated = useRef(false);

  const view = useAtomValue(viewAtom);
  const setPlot = useUpdateAtom(plotAtom);
  const setPlants = useUpdateAtom(plantsAtom);
  const setObjects = useUpdateAtom(objectsAtom);

  // @ts-ignore
  useAtomDevtools(objectsAtom);

  const { data: plantsDetails } = useQuery<PlantDetails[]>('plants', () =>
    fetch('/api/plants').then((res) => res.json())
  );

  const { data: objectsFromDb } = useQuery<GardenObject[]>('objects', () =>
    fetch('/api/objects').then((res) => res.json())
  );

  const { data: config } = useQuery<{ width: number; height: number }>(
    'config',
    () => fetch('/api/config').then((res) => res.json())
  );

  useLayoutEffect(() => {
    if (hydrated.current) {
      return;
    }

    if (objectsFromDb && !isEmpty(objectsFromDb)) {
      // When store is initially hydrated with objects from the DB we skip 'pixels-to-meters' conversion step,
      // because objects stored in DB already use meters.
      setObjects({
        type: 'replaceAll',
        payload: objectsFromDb,
        units: 'meters',
      });
    }

    if (plantsDetails) setPlants(plantsDetails);

    if (config) {
      setPlot({
        width: config.width,
        height: config.height,
      });
    }

    hydrated.current = true;
  }, [objectsFromDb, setObjects, plantsDetails, setPlants, config, setPlot]);

  if (!hydrated) <div className={styles.root} />;

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
            <SidebarRightConnected />
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
