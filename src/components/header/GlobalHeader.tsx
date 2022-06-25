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
          style={{ marginRight: '5px' }}
          small
          active={view === Views.PLAN}
          onClick={() => setView(Views.PLAN)}
        >
          Plan
        </Button>
        <Button
          style={{ marginRight: '5px' }}
          small
          active={view === Views.TABLE}
          onClick={() => setView(Views.TABLE)}
        >
          Kalender
        </Button>
        <Button
          small
          active={view === Views.VARIETIES}
          onClick={() => setView(Views.VARIETIES)}
        >
          Kulturen & Sorten
        </Button>
      </ButtonGroup>
    </div>
  );
};
