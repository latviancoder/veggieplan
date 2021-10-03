import { useAtom } from 'jotai';
import { modeAtom, plantsAtom, selectedPlantAtom } from '../../atoms/atoms';
import styles from './Sidebar.module.css';
import { Modes } from '../../types';
import classnames from 'classnames';
import { useAtomValue } from 'jotai/utils';

export const Sidebar = () => {
  const plants = useAtomValue(plantsAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const [selectedPlant, setSelectedPlant] = useAtom(selectedPlantAtom);

  return (
    <aside className={styles.root}>
      <div className={styles.block}>
        <div>Shapes</div>
        <button
          onClick={() => {
            setMode(Modes.CREATION);
            setSelectedPlant(null);
          }}
          className={classnames(styles.button, {
            [styles.buttonSelected]: mode === Modes.CREATION && !selectedPlant,
          })}
        >
          []
        </button>
      </div>
      <div className={styles.block}>
        <div>Plants</div>
        {plants?.map(({ id, name }) => (
          <button
            key={id}
            onClick={() => {
              setMode(Modes.CREATION);
              setSelectedPlant(id);
            }}
            className={classnames(styles.button, {
              [styles.buttonSelected]:
                mode === Modes.CREATION && selectedPlant === id,
            })}
          >
            {name}
          </button>
        ))}
      </div>
    </aside>
  );
};
