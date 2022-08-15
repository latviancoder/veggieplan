/* eslint-disable react-hooks/rules-of-hooks */
import { useAuth0 } from '@auth0/auth0-react';
import { useAtomDevtools } from 'jotai/devtools';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { lazy, Suspense, useEffect } from 'react';
import { useQuery } from 'react-query';

import {
  accessTokenAtom,
  objectsAtom,
  plantsAtom,
  plotAtom,
  varietiesAtom,
  viewAtom,
} from 'atoms';
import { PlantsTable } from 'components/plantsTable/PlantsTable';
import { useAccessToken } from 'hooks/useAccessToken';
import { useAutosave } from 'hooks/useAutoSave';
import { GardenObject, PlantDetails, Variety, Views } from 'types';

import { DrawableArea } from '../drawableArea/DrawableArea';
import { GlobalHeader } from '../header/GlobalHeader';
import { MonthsSelector } from '../monthsSelector/MonthsSelector';
import { SidebarLeft } from '../sidebarLeft/SidebarLeft';
import { SidebarRightConnected } from '../sidebarRight/SidebarRight';
import styles from './Root.module.css';

const CalendarTable = lazy(() => import('../calendarTable/CalendarTable'));

const Root = () => {
  const token = useAccessToken();

  const { isAuthenticated } = useAuth0();

  const view = useAtomValue(viewAtom);
  const setPlot = useUpdateAtom(plotAtom);
  const setPlants = useUpdateAtom(plantsAtom);
  const setObjects = useUpdateAtom(objectsAtom);
  const setVarieties = useUpdateAtom(varietiesAtom);

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
      const payload = await fetch('/api/objects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());

      setObjects({
        payload,
        type: 'replaceAll',
        units: 'meters',
      });

      return payload;
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  useQuery<Variety[]>(['varieties'], {
    queryFn: async () => {
      const payload = await fetch('/api/varieties', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());

      setVarieties(payload);

      return payload;
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  useQuery<{ width: number; height: number }>(['config'], {
    queryFn: async () => {
      const payload = await fetch('/api/config', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());

      setPlot({
        width: payload.width,
        height: payload.height,
      });

      return payload;
    },
    enabled: isAuthenticated,
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
      <GlobalHeader>
        {view === Views.PLAN && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginRight: '5px',
            }}
          >
            <MonthsSelector />
          </div>
        )}
      </GlobalHeader>
      <div className={styles.content}>
        {view === Views.PLAN && (
          <>
            <SidebarLeft />
            <DrawableArea />
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
