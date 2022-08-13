import { Checkbox, Classes, Colors, FormGroup } from '@blueprintjs/core';
import { DateInput, DateInputProps, DateUtils } from '@blueprintjs/datetime';
import { addYears, parse } from 'date-fns';
import { useUpdateAtom } from 'jotai/utils';
import { memo, useEffect, useState } from 'react';

import { objectsAtom } from 'atoms';
import { Plant } from 'types';
import { formatDate, getTerminalDates } from 'utils/utils';

import { localeUtils } from '../../datepickerLocaleUtils';
import { PlantDatesBar } from '../plantDatesBar/PlantDatesBar';
import styles from './PlantDates.module.scss';
import commonStyles from './SidebarRight.module.scss';

type Props = Pick<
  Plant,
  | 'id'
  | 'dateStartIndoors'
  | 'dateTransplant'
  | 'dateDirectSow'
  | 'dateFirstHarvest'
  | 'dateLastHarvest'
>;

const parseDate = (str: string) => {
  if (!str) return null;

  const parsed = parse(str, 'dd.MM.yyyy', new Date());

  if (DateUtils.isDateValid(parsed)) {
    return parsed;
  }

  return false;
};

export const PlantDates = memo((props: Props) => {
  const {
    id,
    dateStartIndoors,
    dateTransplant,
    dateDirectSow,
    dateFirstHarvest,
    dateLastHarvest,
  } = props;

  const setObjects = useUpdateAtom(objectsAtom);
  const [seedStart, setSeedStart] = useState(
    !!(dateStartIndoors || dateTransplant)
  );

  useEffect(() => {
    setSeedStart(!!(dateStartIndoors || dateTransplant));
  }, [dateStartIndoors, dateTransplant, id]);

  const terminalDates = getTerminalDates(props);

  const updateDateCreator =
    (
      dateProp:
        | 'dateStartIndoors'
        | 'dateTransplant'
        | 'dateDirectSow'
        | 'dateFirstHarvest'
        | 'dateLastHarvest'
    ): DateInputProps['onChange'] =>
    (date, isUserChange) => {
      if (isUserChange) {
        setObjects({
          type: 'updateSingle',
          payload: {
            object: {
              [dateProp]: date ? date.toISOString() : undefined,
            },
            id,
          },
        });
      }
    };

  const defaultMaxDate = addYears(Date.now(), 2);
  const defaultMinDate = addYears(Date.now(), -1);

  const defaultProps = {
    dayPickerProps: { fixedWeeks: true },
    formatDate,
    parseDate,
    localeUtils,
    placeholder: 'TT.MM.JJJJ',
  };

  return (
    <>
      <div className={styles.header}>
        <h6
          className={Classes.HEADING}
          style={{ color: Colors.GRAY3, margin: 0 }}
        >
          Timings
        </h6>
        <Checkbox
          style={{ margin: 0 }}
          label="Mit Voranzucht"
          checked={seedStart}
          onChange={() => setSeedStart(!seedStart)}
        />
      </div>
      <div className={commonStyles.twoColumns}>
        {seedStart && (
          <>
            <FormGroup
              label={'Voranzucht'}
              labelFor="seed-start"
              style={{ margin: 0 }}
            >
              <DateInput
                {...defaultProps}
                inputProps={{ id: 'seed-start' }}
                dayPickerProps={{ fixedWeeks: true }}
                minDate={defaultMinDate}
                maxDate={terminalDates.earliestHarvest || defaultMaxDate}
                value={dateStartIndoors ? new Date(dateStartIndoors) : null}
                onChange={updateDateCreator('dateStartIndoors')}
              />
            </FormGroup>
            <FormGroup
              label={'Auspflanzen'}
              labelFor="transplant"
              style={{ margin: 0 }}
            >
              <DateInput
                {...defaultProps}
                minDate={terminalDates.earliestPlanting || defaultMinDate}
                maxDate={terminalDates.earliestHarvest || defaultMaxDate}
                inputProps={{ id: 'transplant' }}
                value={dateTransplant ? new Date(dateTransplant) : null}
                onChange={updateDateCreator('dateTransplant')}
              />
            </FormGroup>
          </>
        )}
        {!seedStart && (
          <>
            <FormGroup
              label={'Aussaat ins Freiland'}
              labelFor="sow-outside"
              style={{ margin: 0 }}
            >
              <DateInput
                {...defaultProps}
                minDate={defaultMinDate}
                maxDate={terminalDates.earliestHarvest || defaultMaxDate}
                inputProps={{ id: 'sow-outside' }}
                value={dateDirectSow ? new Date(dateDirectSow) : null}
                onChange={updateDateCreator('dateDirectSow')}
              />
            </FormGroup>
            <div />
          </>
        )}
        <FormGroup
          label={'Erste Ernte'}
          labelFor="first-harvest"
          style={{ margin: 0 }}
        >
          <DateInput
            {...defaultProps}
            minDate={terminalDates.latestPlanting || defaultMinDate}
            maxDate={terminalDates.latestHarvest || defaultMaxDate}
            inputProps={{ id: 'first-harvest' }}
            value={dateFirstHarvest ? new Date(dateFirstHarvest) : null}
            onChange={updateDateCreator('dateFirstHarvest')}
          />
        </FormGroup>
        <FormGroup
          label={'Letzte Ernte'}
          labelFor="last-harvest"
          style={{ margin: 0 }}
        >
          <DateInput
            {...defaultProps}
            minDate={terminalDates.latestPlanting || defaultMinDate}
            maxDate={defaultMaxDate}
            inputProps={{ id: 'last-harvest' }}
            value={dateLastHarvest ? new Date(dateLastHarvest) : null}
            onChange={updateDateCreator('dateLastHarvest')}
          />
        </FormGroup>
      </div>
      <PlantDatesBar
        dateStartIndoors={dateStartIndoors}
        dateTransplant={dateTransplant}
        dateDirectSow={dateDirectSow}
        dateFirstHarvest={dateFirstHarvest}
        dateLastHarvest={dateLastHarvest}
        showMonthTitle={true}
      />
    </>
  );
});
