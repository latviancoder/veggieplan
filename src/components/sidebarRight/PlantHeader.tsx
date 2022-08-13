import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Suggest2 } from '@blueprintjs/select';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { memo, useEffect, useState } from 'react';

import { objectsAtom, varietiesAtom } from 'atoms';
import { PlantDetails, Variety } from 'types';

import { getPlantName } from '../../utils/utils';
import styles from './PlantHeader.module.scss';

type Props = {
  objectId: string;
  plantId: number;
  varietyId?: string;
  plantDetails: PlantDetails;
};

export const PlantHeader = memo(
  ({ plantDetails, objectId, varietyId, plantId }: Props) => {
    const setObjects = useUpdateAtom(objectsAtom);

    const allVarieties = useAtomValue(varietiesAtom);
    const plantVarieties = allVarieties.filter(
      (variety) => variety.plantId === plantId
    );

    const [showVarietySelect, setShowVarietySelect] = useState(false);

    useEffect(() => {
      return () => setShowVarietySelect(false);
    }, [objectId]);

    const itemRenderer: ItemRenderer<Variety> = (
      item,
      { modifiers, handleClick }
    ) => (
      <MenuItem
        active={modifiers.active}
        onClick={handleClick}
        text={item.name}
        key={item.name}
      />
    );

    const inputValueRenderer = (inputValue: Variety) => inputValue.name;

    const itemPredicate: ItemPredicate<Variety> = (
      query,
      item,
      index,
      exactMatch
    ) => {
      const Title = item.name.toLowerCase();
      const Query = query.toLowerCase();

      if (exactMatch) {
        return Title === query;
      } else {
        return Title.indexOf(Query) >= 0;
      }
    };

    const onItemSelect = (variety: Variety) => {
      if (variety.id) {
        setObjects({
          type: 'updateSingle',
          payload: {
            object: {
              varietyId: variety.id,
            },
            id: objectId,
          },
        });
      }

      setShowVarietySelect(false);
    };

    const selectedVariety = allVarieties?.find(({ id }) => id === varietyId);

    return (
      <div className={styles.header}>
        {!showVarietySelect && (
          <h4 className={Classes.HEADING} style={{ margin: 0 }}>
            {getPlantName(plantDetails.name, selectedVariety?.name)}
          </h4>
        )}
        {showVarietySelect ? (
          <Suggest2
            inputValueRenderer={inputValueRenderer}
            items={plantVarieties}
            itemRenderer={itemRenderer}
            itemPredicate={itemPredicate}
            onItemSelect={onItemSelect}
            selectedItem={selectedVariety}
            inputProps={{
              placeholder: 'Sorte auswählen',
              autoFocus: true,
              small: true,
              onBlur: () => {
                setTimeout(() => setShowVarietySelect(false), 100);
              },
            }}
            popoverProps={{ minimal: true }}
            itemsEqual={(varA, varB) => varA.name === varB.name}
            fill
          />
        ) : (
          <Button
            text="Sorte"
            icon="edit"
            onClick={() => {
              setShowVarietySelect(true);
            }}
            small
            minimal
            intent="primary"
          />
        )}
      </div>
    );
  }
);
