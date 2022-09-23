/* eslint-disable react-hooks/rules-of-hooks */
import { useAuth0 } from '@auth0/auth0-react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { useAtomDevtools } from 'jotai/devtools';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueries, useQuery } from 'react-query';

import {
  objectsAtom,
  plantsAtom,
  configAtom,
  varietiesAtom,
  viewAtom,
  objectsInMetersAtom,
} from 'atoms';
import { Loader } from 'components/loader/Loader';
import { PlantsTable } from 'components/plantsTable/PlantsTable';
import { useAccessToken } from 'hooks/useAccessToken';
import { useAutosave } from 'hooks/useAutoSave';
import { GardenObject, PlantDetails, Variety, Views } from 'types';
import { post } from 'utils/utils';

import { DrawableArea } from '../drawableArea/DrawableArea';
import { GlobalHeader } from '../header/GlobalHeader';
import { MonthsSelector } from '../monthsSelector/MonthsSelector';
import { SidebarLeft } from '../sidebarLeft/SidebarLeft';
import { SidebarRightConnected } from '../sidebarRight/SidebarRight';
import styles from './Root.module.css';

const CalendarTable = lazy(() => import('../calendarTable/CalendarTable'));

const Root = () => {
  const { t, i18n } = useTranslation();

  const token = useAccessToken();
  const { isAuthenticated } = useAuth0();

  const view = useAtomValue(viewAtom);
  const setPlants = useUpdateAtom(plantsAtom);
  const [config, setConfig] = useAtom(configAtom);
  const objectsInMeters = useAtomValue(objectsInMetersAtom);
  const setObjects = useUpdateAtom(objectsAtom);
  const [varieties, setVarieties] = useAtom(varietiesAtom);

  // @ts-ignore
  useAtomDevtools(objectsAtom);

  // Bootstrap determines if this is first login after signup
  // If it is: we save to database the state saved in web storage.
  //
  // Other queries wait for this query to finish because the app uses suspense.
  // This query throws a promise internally and suspends the component before the other queries run.
  useQuery(
    ['bootstrap'],
    async () =>
      await post('/api/bootstrap', {
        body: {
          config,
          objects: objectsInMeters,
          varieties,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
    {
      enabled: isAuthenticated,
    }
  );

  useQuery<PlantDetails[]>(['plants', i18n.resolvedLanguage], {
    queryFn: async () => {
      const payload = await fetch(
        `/api/plants?language=${i18n.resolvedLanguage}`
      ).then((res) => res.json());

      setPlants(payload);

      return payload;
    },
    refetchOnWindowFocus: false,
  });

  useQuery<{ width: number; height: number }>(['config'], {
    queryFn: async () => {
      const payload = await fetch('/api/config', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());

      setConfig({
        width: payload.width,
        height: payload.height,
      });

      return payload;
    },
    enabled: isAuthenticated,
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

  // Editor page doesn't have scrollbars
  useEffect(() => {
    if (view === Views.PLAN) {
      document.body.classList.add('overflow');
    } else {
      document.body.classList.remove('overflow');
    }
  }, [view]);

  useAutosave();

  const content = useMemo(
    () => (
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
            <Suspense
              fallback={
                <Loader aria-label={t('Loading...')}>{t('Loading...')}</Loader>
              }
            >
              <CalendarTable />
            </Suspense>
          )}
          {view === Views.VARIETIES && (
            <Suspense
              fallback={
                <Loader aria-label={t('Loading...')}>{t('Loading...')}</Loader>
              }
            >
              <PlantsTable />
            </Suspense>
          )}
        </div>
      </div>
    ),
    [view]
  );

  return <>{content}</>;
};

export default Root;
