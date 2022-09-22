import {
  Button,
  Classes,
  Dialog,
  FormGroup,
  InputGroup,
  NumericInput,
  Tag,
} from '@blueprintjs/core';
import { useUpdateAtom } from 'jotai/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNumericInputCallback } from 'hooks/useNumericInputCallback';
import { Variety } from 'types';

import { varietyModalAtom, VarietyModalParams } from './PlantsTable';

const isEditMode = (
  mode: 'create' | 'edit',
  variety?: Variety
): variety is Variety => {
  return mode === 'edit';
};

export const VarietyUpdateModal = ({
  plant,
  isOpen,
  onSave,
  mode,
  variety,
}: VarietyModalParams) => {
  const { t } = useTranslation();
  const plantOrVariety = isEditMode(mode, variety) ? variety : plant;

  const { name, rowSpacing, inRowSpacing, maturity } = plantOrVariety;

  const setVarietyModal = useUpdateAtom(varietyModalAtom);

  const [varietyName, setVarietyName] = useState(
    mode === 'edit' ? plantOrVariety.name : ''
  );

  const [inRowSpacingString, inRowSpacingNumber, onInRowSpacingChange] =
    useNumericInputCallback(inRowSpacing);

  const [rowSpacingString, rowSpacingNumber, onRowSpacingChange] =
    useNumericInputCallback(rowSpacing);

  const [maturityString, maturityNumber, onMaturityChange] =
    useNumericInputCallback(maturity);

  const onClose = () => {
    setVarietyModal({
      isOpen: false,
    });
  };

  return (
    <Dialog
      title={`${name}: ${
        mode === 'create' ? t('Add variety') : t('Edit variety')
      }`}
      isCloseButtonShown
      transitionDuration={0}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label={t('Name')} labelFor="name">
          <InputGroup
            autoComplete="off"
            id="name"
            fill
            value={varietyName}
            onChange={(e) => setVarietyName(e.target.value)}
          />
        </FormGroup>
        <FormGroup label={t('Spacing in row')} labelFor="inRowSpacing">
          <NumericInput
            id="inRowSpacing"
            buttonPosition="none"
            locale="de-DE"
            fill
            value={inRowSpacingString}
            onValueChange={onInRowSpacingChange}
            rightElement={<Tag minimal>cm</Tag>}
          />
        </FormGroup>
        <FormGroup label={t('Spacing between rows')} labelFor="rowSpacing">
          <NumericInput
            id="rowSpacing"
            buttonPosition="none"
            locale="de-DE"
            fill
            value={rowSpacingString}
            onValueChange={onRowSpacingChange}
            rightElement={<Tag minimal>cm</Tag>}
          />
        </FormGroup>
        <FormGroup label={t('Maturity')} labelFor="maturity">
          <NumericInput
            id="maturity"
            buttonPosition="none"
            locale="de-DE"
            fill
            value={maturityString}
            onValueChange={onMaturityChange}
            rightElement={<Tag minimal>{t('weeks')}</Tag>}
          />
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button
            intent="primary"
            onClick={() => {
              onSave({
                name: varietyName,
                inRowSpacing: inRowSpacingNumber,
                maturity: maturityNumber,
                rowSpacing: rowSpacingNumber,
              });

              onClose();
            }}
          >
            {t('Save')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
