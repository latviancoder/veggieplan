import { Button, ButtonGroup } from '@blueprintjs/core';
import { useAtom, useAtomValue } from 'jotai';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { selectedDatesAtom, viewAtom } from 'atoms';
import { UserActions } from 'components/sidebarLeft/userActions/UserActions';
import { useFormatDate } from 'hooks/useFormatDate';
import { Views } from 'types';

import styles from './GlobalHeader.module.scss';

export const GlobalHeader: FC<any> = memo(({ children }) => {
  const formatDate = useFormatDate();
  const { t } = useTranslation();
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
          {t('Plan')}
        </Button>
        <Button
          style={{ marginRight: '5px' }}
          small
          active={view === Views.TABLE}
          onClick={() => setView(Views.TABLE)}
        >
          {t('Calendar')}
        </Button>
        <Button
          small
          active={view === Views.VARIETIES}
          onClick={() => setView(Views.VARIETIES)}
        >
          {t('Species and varieties')}
        </Button>
      </ButtonGroup>
      <div className={styles.right}>
        {selectedDates && view === Views.PLAN && (
          <div className={styles.selectedDates}>
            {formatDate(selectedDates?.start, 'PP')} -{' '}
            {formatDate(selectedDates?.end, 'PP')}
          </div>
        )}
        <div>{children}</div>
        <div style={{ paddingRight: '5px' }}>
          <UserActions />
        </div>
      </div>
    </div>
  );
});
