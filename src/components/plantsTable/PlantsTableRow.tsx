import { Button } from '@blueprintjs/core';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { nanoid } from 'nanoid';
import { memo } from 'react';

import { varietiesAtom } from 'atoms';
import { PlantDetails } from 'types';

import { varietyModalAtom } from './PlantsTable';
import styles from './PlantsTableRow.module.scss';

type Props = {
  plant: PlantDetails;
};

export const PlantsTableRow = memo(({ plant }: Props) => {
  const [varieties, setVarieties] = useAtom(varietiesAtom);
  const { name, id, rowSpacing, inRowSpacing, maturity } = plant;

  const setVarietyModal = useUpdateAtom(varietyModalAtom);

  const onCreateVariety = () => {
    setVarietyModal({
      isOpen: true,
      mode: 'create',
      plant,
      onSave: (
        params: Pick<
          PlantDetails,
          'rowSpacing' | 'inRowSpacing' | 'name' | 'maturity'
        >
      ) => {
        setVarieties([...varieties, { plantId: id, id: nanoid(), ...params }]);
      },
    });
  };

  return (
    <>
      <tr>
        <td style={{ height: '1px' }}>
          <div className={styles.name}>
            {name}
            <Button
              minimal
              intent="primary"
              small
              icon="plus"
              onClick={onCreateVariety}
            >
              Sorte
            </Button>
          </div>
        </td>
        <td>{inRowSpacing}</td>
        <td>{rowSpacing}</td>
        <td>{maturity}</td>
      </tr>
    </>
  );
});
