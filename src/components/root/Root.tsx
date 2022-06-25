import { useAtomDevtools } from 'jotai/devtools';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { useQuery } from 'react-query';

import {
  plantsAtom,
  plotAtom,
  varietiesAtom,
  viewAtom,
} from '../../atoms/atoms';
import { objectsAtom } from '../../atoms/objectsAtom';
import { GardenObject, PlantDetails, Variety, Views } from '../../types';
import { SidebarRightConnected } from '../sidebarRight/SidebarRight';
import { DrawableArea } from '../drawableArea/DrawableArea';
import { GlobalHeader } from '../header/GlobalHeader';
import { MonthsSelectorContainer } from '../monthsSelector/MonthsSelector';
import { SidebarLeft } from '../sidebarLeft/SidebarLeft';
import styles from './Root.module.css';
import { useAutosave } from 'hooks/useAutoSave';
import { PlantsTable } from 'components/plantsTable/PlantsTable';

const CalendarTable = lazy(() => import('../calendarTable/CalendarTable'));

const Root = () => {
  useAutosave();

  const hydrated = useRef(false);

  const view = useAtomValue(viewAtom);
  const setPlot = useUpdateAtom(plotAtom);
  const setPlants = useUpdateAtom(plantsAtom);
  const setObjects = useUpdateAtom(objectsAtom);
  const setVarieties = useUpdateAtom(varietiesAtom);

  // @ts-ignore
  useAtomDevtools(objectsAtom);

  const { data: plantsDetails } = useQuery<PlantDetails[]>('plants', () =>
    fetch('/api/plants').then((res) => res.json())
  );

  const { data: objectsFromDb } = useQuery<GardenObject[]>('objects', () =>
    fetch('/api/objects').then((res) => res.json())
  );

  const { data: varietiesFromDb } = useQuery<Variety[]>('varieties', () =>
    fetch('/api/varieties').then((res) => res.json())
  );

  const { data: config } = useQuery<{ width: number; height: number }>(
    'config',
    () => fetch('/api/config').then((res) => res.json())
  );

  // Editor page doesn't have scrollbars
  useEffect(() => {
    if (view === Views.PLAN) {
      document.body.classList.add('overflow');
    } else {
      document.body.classList.remove('overflow');
    }
  }, [view]);

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

    if (varietiesFromDb && !isEmpty(varietiesFromDb)) {
      setVarieties(varietiesFromDb);
    }

    if (plantsDetails) setPlants(plantsDetails);

    if (config) {
      setPlot({
        width: config.width,
        height: config.height,
      });
    }

    hydrated.current = true;
  }, [
    objectsFromDb,
    setObjects,
    plantsDetails,
    setPlants,
    config,
    setPlot,
    varietiesFromDb,
    setVarieties,
  ]);

  if (!hydrated.current) return <div className={styles.root} />;

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
          <Suspense fallback="Wird geladen..">
            <CalendarTable />
          </Suspense>
        )}
        {view === Views.VARIETIES && (
          <Suspense fallback="Wird geladen..">
            <PlantsTable />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Root;
