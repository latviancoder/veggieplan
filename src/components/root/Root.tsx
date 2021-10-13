import styles from './Root.module.css';
import { SidebarLeft } from '../sidebarLeft/SidebarLeft';
import { Zoom } from '../zoom/Zoom';
import { CanvasContainer } from '../canvasContainer/CanvasContainer';
import { useQuery } from 'react-query';
import { GardenObject, PlantDetails } from '../../types';
import { canvasAtom, plantsAtom, plotCanvasAtom } from '../../atoms/atoms';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useEffect } from 'react';
import { Autosave } from '../autosave/Autosave';
import { useUtils } from '../../utils';
import { objectsAtom } from '../../atoms/objectsAtom';
import isEmpty from 'lodash.isempty';
import { useAtom } from 'jotai';
import { DetailsBar } from '../detailsBar/DetailsBar';

const Root = () => {
  const { meterToPx } = useUtils();

  const canvas = useAtomValue(canvasAtom);
  const plotCanvas = useAtomValue(plotCanvasAtom);

  const setPlants = useUpdateAtom(plantsAtom);
  const [objects] = useAtom(objectsAtom);
  const setObjects = useUpdateAtom(objectsAtom);

  const { isLoading: isPlantsLoading, data: plants } = useQuery<PlantDetails[]>(
    'plants',
    () => fetch('/api/plants').then((res) => res.json())
  );

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
      setObjects({ objects: objectsFromDb, type: 'meters' });
    }
  }, [objectsFromDb, plotCanvas, canvas, setObjects, meterToPx, objects]);

  useEffect(() => {
    if (plants) setPlants(plants);
  }, [plants, setPlants]);

  if (isPlantsLoading || isObjectsLoading) return null;

  return (
    <div className={styles.root}>
      <SidebarLeft />
      <CanvasContainer />
      <DetailsBar />
      {/* Absolute positioned stuff */}
      <Zoom />
      <Autosave />
    </div>
  );
};

export default Root;
