import { Alert, Button, Icon, IconSize, Intent } from '@blueprintjs/core';
import produce from 'immer';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useState } from 'react';

import { varietiesAtom } from 'atoms';
import { PlantDetails, Variety } from 'types';

import { varietyModalAtom } from './PlantsTable';
import styles from './PlantsTableVarietyRow.module.scss';

type Props = {
  variety: Variety;
  plant: PlantDetails;
};

export const PlantsTableVarietyRow = ({ variety, plant }: Props) => {
  const { id, name, inRowSpacing, rowSpacing, maturity } = variety;

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [varieties, setVarieties] = useAtom(varietiesAtom);
  const setVarietyModal = useUpdateAtom(varietyModalAtom);

  const onDelete = () => {
    setVarieties(varieties.filter((v) => v.id !== id));
  };

  const onVarietyEdit = () => {
    setVarietyModal({
      isOpen: true,
      mode: 'edit',
      variety,
      plant,
      onSave: (updatedVariety) => {
        const index = varieties.findIndex(({ id: vId }) => id === vId);

        setVarieties(
          produce(varieties, (draft) => {
            draft[index] = { ...draft[index], ...updatedVariety };
          })
        );
      },
    });
  };

  return (
    <>
      <tr>
        <td style={{ height: '1px' }}>
          <div className={styles.nameCell}>
            <span className={styles.name}>
              <Button minimal small icon="nest" />
              {name}
            </span>
            <span>
              <Button
                icon="edit"
                small
                minimal
                intent="primary"
                onClick={onVarietyEdit}
              />
              <Button
                icon="trash"
                small
                minimal
                intent="primary"
                onClick={() => setDeleteConfirm(true)}
              />
            </span>
          </div>
        </td>
        <td>{inRowSpacing}</td>
        <td>{rowSpacing}</td>
        <td>{maturity}</td>
      </tr>
      <Alert
        transitionDuration={0}
        canEscapeKeyCancel
        canOutsideClickCancel
        isOpen={deleteConfirm}
        confirmButtonText="Löschen"
        cancelButtonText="Abbrechen"
        icon={<Icon icon="trash" size={IconSize.LARGE} intent="danger" />}
        intent={Intent.DANGER}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={onDelete}
      >
        <p>{variety.name} löschen?</p>
      </Alert>
    </>
  );
};
