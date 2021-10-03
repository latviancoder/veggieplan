import styles from './App.module.css';
import { Sidebar } from './components/sidebar/Sidebar';
import { Zoom } from './components/zoom/Zoom';
import { Container } from './Container';
import { QueryClient, useQuery } from 'react-query';
import { PlantDetails } from './types';
import { plantsAtom } from './atoms/atoms';
import { useUpdateAtom } from 'jotai/utils';
import { useEffect } from 'react';

const queryClient = new QueryClient();

const Root = () => {
  const setPlants = useUpdateAtom(plantsAtom);
  const { isLoading, data: plants } = useQuery<PlantDetails[]>('plants', () =>
    fetch('/api/plants').then((res) => res.json())
  );

  useEffect(() => {
    if (plants) setPlants(plants);
  }, [plants]);

  if (isLoading) return null;

  return (
    <div className={styles.root}>
      <Sidebar />
      <Container />
      <Zoom />
    </div>
  );
};

export default Root;
