import {
  Classes,
  Colors,
  FormGroup,
  NumericInput,
  Tag,
} from '@blueprintjs/core';
import { useUpdateAtom } from 'jotai/utils';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { objectsAtom } from 'atoms';
import { PlantDetails } from 'types';

import styles from './SidebarRight.module.scss';

type Props = {
  objectId: string;
  plantDetails: PlantDetails;
};

export const PlantSpacing = memo(({ plantDetails, objectId }: Props) => {
  const { t } = useTranslation();
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
        {t('Spacing')}
      </h6>
      <div className={styles.twoColumns}>
        <div>
          <FormGroup
            label={t('In row')}
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
              rightElement={<Tag minimal>cm</Tag>}
            />
          </FormGroup>
        </div>
        <div>
          <FormGroup
            label={t('Between rows')}
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
              rightElement={<Tag minimal>{t('cm')}</Tag>}
            />
          </FormGroup>
        </div>
      </div>
    </>
  );
});
