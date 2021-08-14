import React from 'react';
import { useAtom } from 'jotai';
import { modeAtom } from './atoms/atoms';
import styles from './Sidebar.module.css';
import { zoomAtom } from './atoms/zoomAtom';
import { Modes } from './types';

export const Sidebar = () => {
  const [, setZoom] = useAtom(zoomAtom);
  const [mode, setMode] = useAtom(modeAtom);

  return (
    <aside className={styles.root}>
      <button
        onClick={() => setMode(Modes.CREATION)}
        className={styles.button}
        style={{
          backgroundColor: mode === Modes.CREATION ? 'lightblue' : 'initial',
        }}
      >
        []
      </button>
      <br />
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
    </aside>
  );
};
