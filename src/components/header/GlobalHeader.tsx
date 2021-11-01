import { useAtom } from 'jotai';

import { Button, ButtonGroup } from '@blueprintjs/core';

import { viewAtom } from '../../atoms/atoms';
import { Views } from '../../types';
import styles from './GlobalHeader.module.scss';

export const GlobalHeader = () => {
  const [view, setView] = useAtom(viewAtom);

  return (
    <div className={styles.root}>
      <ButtonGroup minimal>
        <Button
          icon="map"
          small
          active={view === Views.PLAN}
          onClick={() => setView(Views.PLAN)}
        >
          Plan
        </Button>
        <Button
          icon="calendar"
          small
          active={view === Views.TABLE}
          onClick={() => setView(Views.TABLE)}
        >
          Tabellenansicht
        </Button>
      </ButtonGroup>
    </div>
  );
};
