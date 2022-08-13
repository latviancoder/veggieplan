import { Button, ButtonGroup } from '@blueprintjs/core';
import { useAtom, useAtomValue } from 'jotai';
import { FC, memo } from 'react';

import { selectedDatesAtom, viewAtom } from 'atoms';
import { Views } from 'types';
import { formatDate } from 'utils/utils';

import styles from './GlobalHeader.module.scss';

export const GlobalHeader: FC<any> = memo(({ children }) => {
  const selectedDates = useAtomValue(selectedDatesAtom);
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
      <div className={styles.right}>
        {selectedDates && view === Views.PLAN && (
          <div className={styles.selectedDates}>
            {formatDate(selectedDates?.start, 'dd MMM')} -{' '}
            {formatDate(selectedDates?.end, 'dd MMM')}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
});
