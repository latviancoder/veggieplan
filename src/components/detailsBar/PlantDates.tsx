import { addYears, format, parse } from 'date-fns';
import { useUpdateAtom } from 'jotai/utils';
import { useEffect, useState } from 'react';

import { Checkbox, Classes, Colors, FormGroup } from '@blueprintjs/core';
import { DateInput, DateUtils } from '@blueprintjs/datetime';

import { objectsAtom } from '../../atoms/objectsAtom';
import { localeUtils } from '../../datepickerLocaleUtils';
import { Plant, PlantDetails } from '../../types';
import commonStyles from './DetailsBar.module.scss';
import styles from './PlantDates.module.scss';
import { PlantDatesBar } from './PlantDatesBar';

type Props = {
  plantObject: Plant;
  plantDetails: PlantDetails;
};

const formatDate = (date: Date) => format(date, 'dd.MM.yyyy');

const parseDate = (str: string) => {
  if (!str) return null;

  const parsed = parse(str, 'dd.MM.yyyy', new Date());

  if (DateUtils.isDateValid(parsed)) {
    return parsed;
  }

  return false;
};

export const PlantDates = ({
  plantDetails,
  plantObject: {
    id,
    dateStartIndoors,
    dateTransplant,
    dateDirectSow,
    dateFirstHarvest,
    dateLastHarvest,
  },
}: Props) => {
  const setObjects = useUpdateAtom(objectsAtom);
  const [seedStart, setSeedStart] = useState(
    !!(dateStartIndoors || dateTransplant)
  );

  useEffect(() => {
    setSeedStart(!!(dateStartIndoors || dateTransplant));
  }, [dateStartIndoors, dateTransplant, id]);

  // todo proper min-max date logic and setting of dates
  const maxDate = addYears(Date.now(), 2);
  const minDate = addYears(Date.now(), -1);

  const defaultProps = {
    dayPickerProps: { fixedWeeks: true },
    maxDate,
    minDate,
    formatDate,
    parseDate,
    localeUtils,
    placeholder: 'DD.MM.YYYY',
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
                value={dateStartIndoors ? new Date(dateStartIndoors) : null}
                onChange={(date, isUserChange) => {
                  if (isUserChange) {
                    setObjects({
                      type: 'updateSingle',
                      payload: {
                        object: {
                          dateStartIndoors: date
                            ? date.toISOString()
                            : undefined,
                        },
                        id,
                      },
                    });
                  }
                }}
              />
            </FormGroup>
            <FormGroup
              label={'Auspflanzen'}
              labelFor="transplant"
              style={{ margin: 0 }}
            >
              <DateInput
                {...defaultProps}
                inputProps={{ id: 'transplant' }}
                value={dateTransplant ? new Date(dateTransplant) : null}
                onChange={(date, isUserChange) => {
                  if (isUserChange) {
                    setObjects({
                      type: 'updateSingle',
                      payload: {
                        object: {
                          dateTransplant: date ? date.toISOString() : undefined,
                        },
                        id,
                      },
                    });
                  }
                }}
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
                inputProps={{ id: 'sow-outside' }}
                value={dateDirectSow ? new Date(dateDirectSow) : null}
                onChange={(date, isUserChange) => {
                  if (isUserChange) {
                    setObjects({
                      type: 'updateSingle',
                      payload: {
                        object: {
                          dateDirectSow: date ? date.toISOString() : undefined,
                        },
                        id,
                      },
                    });
                  }
                }}
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
            inputProps={{ id: 'first-harvest' }}
            value={dateFirstHarvest ? new Date(dateFirstHarvest) : null}
            onChange={(date, isUserChange) => {
              if (isUserChange) {
                setObjects({
                  type: 'updateSingle',
                  payload: {
                    object: {
                      dateFirstHarvest: date ? date.toISOString() : undefined,
                    },
                    id,
                  },
                });
              }
            }}
          />
        </FormGroup>
        <FormGroup
          label={'Letzte Ernte'}
          labelFor="last-harvest"
          style={{ margin: 0 }}
        >
          <DateInput
            {...defaultProps}
            inputProps={{ id: 'last-harvest' }}
            value={dateLastHarvest ? new Date(dateLastHarvest) : null}
            onChange={(date, isUserChange) => {
              if (isUserChange) {
                setObjects({
                  type: 'updateSingle',
                  payload: {
                    object: {
                      dateLastHarvest: date ? date.toISOString() : undefined,
                    },
                    id,
                  },
                });
              }
            }}
          />
        </FormGroup>
      </div>
      <PlantDatesBar
        dateStartIndoors={dateStartIndoors}
        dateTransplant={dateTransplant}
        dateDirectSow={dateDirectSow}
        dateFirstHarvest={dateFirstHarvest}
        dateLastHarvest={dateLastHarvest}
      />
    </>
  );
};
