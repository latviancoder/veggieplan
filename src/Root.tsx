import styles from './App.module.css';
import { Sidebar } from './components/sidebar/Sidebar';
import { Zoom } from './components/zoom/Zoom';
import { Container } from './components/container/Container';
import { useQuery } from 'react-query';
import { GardenObject, PlantDetails } from './types';
import { canvasAtom, plantsAtom, plotCanvasAtom } from './atoms/atoms';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useEffect } from 'react';
import { Autosave } from './components/autosave/Autosave';
import { useHelpers } from './utils';
import produce from 'immer';
import { objectsAtom } from './atoms/objectsAtom';
import isEmpty from 'lodash.isempty';
import { useAtom } from 'jotai';

const Root = () => {
  const { meterToPx } = useHelpers();

  const canvas = useAtomValue(canvasAtom);
  const plotCanvas = useAtomValue(plotCanvasAtom);

  const setPlants = useUpdateAtom(plantsAtom);
  const [objects, setObjects] = useAtom(objectsAtom);

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
      !isEmpty(canvas) &&
      !isEmpty(plotCanvas)
    ) {
      setObjects(
        objectsFromDb.map((obj) =>
          // In DB objects are saved with real dimensions
          produce(obj, (draft) => {
            draft.x = meterToPx(draft.x);
            draft.y = meterToPx(draft.y);
            draft.width = meterToPx(draft.width);
            draft.height = meterToPx(draft.height);
          })
        )
      );
    }
  }, [objectsFromDb, plotCanvas, canvas, objects]);

  useEffect(() => {
    if (plants) setPlants(plants);
  }, [plants]);

  if (isPlantsLoading || isObjectsLoading) return null;

  return (
    <div className={styles.root}>
      <Sidebar />
      <Container />
      <Zoom />
      <Autosave />
    </div>
  );
};

export default Root;
