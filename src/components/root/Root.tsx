/* eslint-disable react-hooks/rules-of-hooks */
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
import { useAtom } from 'jotai';

const CalendarTable = lazy(() => import('../calendarTable/CalendarTable'));

let lul = false;

const simulateRequest = (time: number) =>
  new Promise((r) => setTimeout(r, time));

const Root = () => {
  const view = useAtomValue(viewAtom);
  const [plot, setPlot] = useAtom(plotAtom);
  const [plants, setPlants] = useAtom(plantsAtom);
  const [objects, setObjects] = useAtom(objectsAtom);
  const [varieties, setVarieties] = useAtom(varietiesAtom);

  // @ts-ignore
  useAtomDevtools(objectsAtom);

  useQuery<PlantDetails[]>(['plants'], {
    queryFn: async () => {
      const payload = await fetch('/api/plants').then((res) => res.json());

      setPlants(payload);

      return payload;
    },
    refetchOnWindowFocus: false,
  });

  useQuery<GardenObject[]>(['objects'], {
    queryFn: async () => {
      const payload = await fetch('/api/objects').then((res) => res.json());

      setObjects({
        payload,
        type: 'replaceAll',
        units: 'meters',
      });

      return payload;
    },
    refetchOnWindowFocus: false,
  });

  useQuery<Variety[]>(['varieties'], {
    queryFn: async () => {
      const payload = await fetch('/api/varieties').then((res) => res.json());

      setVarieties(payload);

      return payload;
    },
    refetchOnWindowFocus: false,
  });

  useQuery<{ width: number; height: number }>(['config'], {
    queryFn: async () => {
      const payload = await fetch('/api/config').then((res) => res.json());

      setPlot({
        width: payload.width,
        height: payload.height,
      });

      return payload;
    },
    refetchOnWindowFocus: false,
  });

  // Editor page doesn't have scrollbars
  useEffect(() => {
    if (view === Views.PLAN) {
      document.body.classList.add('overflow');
    } else {
      document.body.classList.remove('overflow');
    }
  }, [view]);

  useAutosave();

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
