import addYears from 'date-fns/addYears';
import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';
import { useUpdateAtom } from 'jotai/utils';
import { ceil } from 'lodash';
import { useEffect, useState } from 'react';

import { Checkbox, Classes, Colors, FormGroup } from '@blueprintjs/core';
import { DateInput, DateUtils } from '@blueprintjs/datetime';

import { objectsAtom } from '../../atoms/objectsAtom';
import { localeUtils } from '../../datepickerLocaleUtils';
import { Plant, PlantDetails } from '../../types';
import commonStyles from './DetailsBar.module.scss';
import styles from './PlantDates.module.scss';

type Props = {
  plantObject: Plant;
  plantDetails: PlantDetails;
};

const formatDate = (date: Date) => dateFnsFormat(date, 'dd.MM.yyyy');

const parseDate = (str: string) => {
  if (!str) return null;

  const parsed = dateFnsParse(str, 'dd.MM.yyyy', new Date());

  if (DateUtils.isDateValid(parsed)) {
    return parsed;
  }

  return false;
};

export const PlantDates = ({ plantDetails, plantObject }: Props) => {
  const setObjects = useUpdateAtom(objectsAtom);
  const [seedStart, setSeedStart] = useState(
    !!(plantObject.dateStartIndoors || plantObject.dateTransplant)
  );

  useEffect(() => {
    setSeedStart(
      !!(plantObject.dateStartIndoors || plantObject.dateTransplant)
    );
  }, [
    plantObject.dateStartIndoors,
    plantObject.dateTransplant,
    plantObject.id,
  ]);

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
                value={
                  plantObject.dateStartIndoors
                    ? new Date(plantObject.dateStartIndoors)
                    : null
                }
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
                        id: plantObject.id,
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
                value={
                  plantObject.dateTransplant
                    ? new Date(plantObject.dateTransplant)
                    : null
                }
                onChange={(date, isUserChange) => {
                  if (isUserChange) {
                    setObjects({
                      type: 'updateSingle',
                      payload: {
                        object: {
                          dateTransplant: date ? date.toISOString() : undefined,
                        },
                        id: plantObject.id,
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
                value={
                  plantObject.dateDirectSow
                    ? new Date(plantObject.dateDirectSow)
                    : null
                }
                onChange={(date, isUserChange) => {
                  if (isUserChange) {
                    setObjects({
                      type: 'updateSingle',
                      payload: {
                        object: {
                          dateDirectSow: date ? date.toISOString() : undefined,
                        },
                        id: plantObject.id,
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
            value={
              plantObject.dateFirstHarvest
                ? new Date(plantObject.dateFirstHarvest)
                : null
            }
            onChange={(date, isUserChange) => {
              if (isUserChange) {
                setObjects({
                  type: 'updateSingle',
                  payload: {
                    object: {
                      dateFirstHarvest: date ? date.toISOString() : undefined,
                    },
                    id: plantObject.id,
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
            value={
              plantObject.dateLastHarvest
                ? new Date(plantObject.dateLastHarvest)
                : null
            }
            onChange={(date, isUserChange) => {
              if (isUserChange) {
                setObjects({
                  type: 'updateSingle',
                  payload: {
                    object: {
                      dateLastHarvest: date ? date.toISOString() : undefined,
                    },
                    id: plantObject.id,
                  },
                });
              }
            }}
          />
        </FormGroup>
      </div>
    </>
  );
};
