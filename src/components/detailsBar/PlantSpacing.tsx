import { useUpdateAtom } from 'jotai/utils';
import { useEffect, useState } from 'react';

import { Classes, Colors, FormGroup, NumericInput } from '@blueprintjs/core';

import { objectsAtom } from '../../atoms/objectsAtom';
import { PlantDetails } from '../../types';
import styles from './DetailsBar.module.scss';

type Props = {
  objectId: string;
  plantDetails: PlantDetails;
};

export const PlantSpacing = ({ plantDetails, objectId }: Props) => {
  const setObjects = useUpdateAtom(objectsAtom);

  const [inRowSpacing, setInRowSpacing] = useState('');
  const [rowSpacing, setRowSpacing] = useState('');

  useEffect(() => {
    setInRowSpacing(plantDetails.inRowSpacing.toString());
  }, [plantDetails.inRowSpacing]);

  useEffect(() => {
    setRowSpacing(plantDetails.rowSpacing.toString());
  }, [plantDetails.rowSpacing]);

  const onInRowSpacingChange = (
    valueAsNumber: number,
    valueAsString: string
  ) => {
    if (!valueAsString) {
      setInRowSpacing('');
      return;
    }

    const value = Math.round(valueAsNumber);

    if (isNaN(value)) return;

    setObjects({
      type: 'updateSingle',
      payload: {
        object: {
          inRowSpacing: value,
        },
        id: objectId,
      },
    });
  };

  const onRowSpacingChange = (valueAsNumber: number, valueAsString: string) => {
    if (!valueAsString) {
      setRowSpacing('');
      return;
    }

    const value = Math.round(valueAsNumber);

    if (isNaN(value)) return;

    setObjects({
      type: 'updateSingle',
      payload: {
        object: {
          rowSpacing: value,
        },
        id: objectId,
      },
    });
  };

  return (
    <>
      <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
        Abstand
      </h6>
      <div className={styles.twoColumns}>
        <div>
          <FormGroup
            label={'In Reihe'}
            labelFor="text-input1"
            style={{ margin: 0 }}
          >
            <NumericInput
              buttonPosition="none"
              id="text-input1"
              placeholder="cm"
              locale="de-DE"
              fill
              value={inRowSpacing}
              onValueChange={onInRowSpacingChange}
            />
          </FormGroup>
        </div>
        <div>
          <FormGroup
            label={'Zwischen Reihen'}
            labelFor="text-input"
            style={{ margin: 0 }}
          >
            <NumericInput
              buttonPosition="none"
              id="text-input"
              placeholder="cm"
              locale="de-DE"
              fill
              value={rowSpacing}
              onValueChange={onRowSpacingChange}
            />
          </FormGroup>
        </div>
      </div>
    </>
  );
};
