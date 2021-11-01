import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import { lazy, Suspense, useEffect } from 'react';
import { useQuery } from 'react-query';

import {
  canvasAtom,
  plantsAtom,
  plotCanvasAtom,
  viewAtom
} from '../../atoms/atoms';
import { objectsAtom } from '../../atoms/objectsAtom';
import { GardenObject, PlantDetails, Views } from '../../types';
import { useUtils } from '../../utils';
import { CanvasContainer } from '../canvasContainer/CanvasContainer';
import { DetailsBar } from '../detailsBar/DetailsBar';
import { GlobalHeader } from '../header/GlobalHeader';
import { SidebarLeft } from '../sidebarLeft/SidebarLeft';
import styles from './Root.module.css';

const Table = lazy(() => import('../table/Table'));

const Root = () => {
  const { meterToPx } = useUtils();

  const view = useAtomValue(viewAtom);
  const canvas = useAtomValue(canvasAtom);
  const plotCanvas = useAtomValue(plotCanvasAtom);
  const [plants, setPlants] = useAtom(plantsAtom);
  const [objects, setObjects] = useAtom(objectsAtom);

  const { isLoading: isPlantsDetailsLoading, data: plantsDetails } = useQuery<
    PlantDetails[]
  >('plants', () => fetch('/api/plants').then((res) => res.json()));

  const { isLoading: isObjectsLoading, data: objectsFromDb } = useQuery<
    GardenObject[]
  >('objects', () => fetch('/api/objects').then((res) => res.json()));

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

  if (isPlantsDetailsLoading || isObjectsLoading || !plants.length) return null;

  return (
    <div className={styles.root}>
      <GlobalHeader />
      <div className={styles.content}>
        <SidebarLeft />
        {view === Views.PLAN && (
          <>
            <CanvasContainer />
            <DetailsBar />
          </>
        )}
        {view === Views.TABLE && (
          <Suspense fallback={null}>
            <Table />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Root;
