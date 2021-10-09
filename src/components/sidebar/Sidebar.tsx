import { useAtom } from 'jotai';
import { modeAtom, plantsAtom, selectedPlantAtom } from '../../atoms/atoms';
import styles from './Sidebar.module.css';
import { Modes } from '../../types';
import { useAtomValue } from 'jotai/utils';
import { Button, Icon } from '@blueprintjs/core';

export const Sidebar = () => {
  const plants = useAtomValue(plantsAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const [selectedPlant, setSelectedPlant] = useAtom(selectedPlantAtom);

  return (
    <aside className={styles.root}>
      <div className={styles.block}>
        <Button
          active={mode === Modes.SELECTION}
          onClick={() => {
            setMode(Modes.SELECTION);
            setSelectedPlant(null);
          }}
        >
          <Icon icon="select" />
        </Button>
        <div>Shapes</div>
        <Button
          onClick={() => {
            setMode(Modes.CREATION);
            setSelectedPlant(null);
          }}
          active={mode === Modes.CREATION && !selectedPlant}
        >
          <Icon icon="widget" />
        </Button>
      </div>
      <div className={styles.block}>
        <div>Plants</div>
        {plants?.map(({ id, name }) => (
          <Button
            key={id}
            onClick={() => {
              setMode(Modes.CREATION);
              setSelectedPlant(id);
            }}
            active={mode === Modes.CREATION && selectedPlant === id}
          >
            {name}
          </Button>
        ))}
      </div>
    </aside>
  );
};
