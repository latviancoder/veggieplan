import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import { useEffect } from 'react';
import { useQuery } from 'react-query';

import { canvasAtom, plantsAtom, plotCanvasAtom } from '../../atoms/atoms';
import { objectsAtom } from '../../atoms/objectsAtom';
import { GardenObject, PlantDetails } from '../../types';
import { useUtils } from '../../utils';
import { Autosave } from '../autosave/Autosave';
import { CanvasContainer } from '../canvasContainer/CanvasContainer';
import { DetailsBar } from '../detailsBar/DetailsBar';
import { SidebarLeft } from '../sidebarLeft/SidebarLeft';
import styles from './Root.module.css';

const Root = () => {
  const { meterToPx } = useUtils();

  const canvas = useAtomValue(canvasAtom);
  const plotCanvas = useAtomValue(plotCanvasAtom);

  const [plants, setPlants] = useAtom(plantsAtom);
  const [objects] = useAtom(objectsAtom);
  const setObjects = useUpdateAtom(objectsAtom);

  const { isLoading: isPlantsDetailsLoading, data: plantsDetails } = useQuery<
    PlantDetails[]
  >('plants', () => fetch('/api/plants').then((res) => res.json()));

  const { isLoading: isObjectsLoading, data: objectsFromDb } = useQuery<
    GardenObject[]
  >('objects', () => fetch('/api/objects').then((res) => res.json()));

  useEffect(() => {
    if (
      objectsFromDb &&
      isEmpty(objects) &&
      !isEmpty(objectsFromDb) &&
      !isEmpty(canvas) &&
      !isEmpty(plotCanvas)
    ) {
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
      <SidebarLeft />
      <CanvasContainer />
      <DetailsBar />
      {/* Absolute positioned stuff */}
      <Autosave />
    </div>
  );
};

export default Root;
