import { useAtom } from 'jotai';
import { modeAtom, selectedPlantAtom } from '../../atoms/atoms';
import styles from './Sidebar.module.css';
import { zoomAtom } from '../../atoms/zoomAtom';
import { Modes } from '../../types';
import { plants } from '../../data/plants';
import { useUpdateAtom } from 'jotai/utils';
import classnames from 'classnames';
import { useQuery } from 'react-query';

export const Sidebar = () => {
  const [mode, setMode] = useAtom(modeAtom);
  const [selectedPlant, setSelectedPlant] = useAtom(selectedPlantAtom);

  const { isLoading, error, data } = useQuery('plants', () =>
    fetch('https://api.github.com/repos/tannerlinsley/react-query').then(
      (res) => res.json()
    )
  );

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
        {plants.map(({ plantID, plantName }) => (
          <button
            key={plantID}
            onClick={() => {
              setMode(Modes.CREATION);
              setSelectedPlant(plantID);
            }}
            className={classnames(styles.button, {
              [styles.buttonSelected]:
                mode === Modes.CREATION && selectedPlant === plantID,
            })}
          >
            {plantName}
          </button>
        ))}
      </div>
    </aside>
  );
};
