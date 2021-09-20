import React from 'react';
import { useAtom } from 'jotai';
import { modeAtom, selectedPlantAtom } from './atoms/atoms';
import styles from './Sidebar.module.css';
import { zoomAtom } from './atoms/zoomAtom';
import { Modes } from './types';
import { plants } from './data/plants';
import { useUpdateAtom } from 'jotai/utils';
import classnames from 'classnames';

export const Sidebar = () => {
  const setZoom = useUpdateAtom(zoomAtom);
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
      <div className={styles.block}>
        <div>Zoom</div>
        <div className={styles.zoom}>
          <button
            onClick={() => setZoom({ direction: 'zoomIn', withTween: true })}
            className={styles.button}
          >
            +
          </button>
          <button
            onClick={() => setZoom({ direction: 'zoomOut', withTween: true })}
            className={styles.button}
          >
            -
          </button>
        </div>
      </div>
    </aside>
  );
};
