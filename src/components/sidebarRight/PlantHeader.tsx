import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useEffect, useState } from 'react';

import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Suggest } from '@blueprintjs/select';

import { objectsAtom } from '../../atoms/objectsAtom';
import { Plant, PlantDetails, Variety } from '../../types';
import { getPlantName } from '../../utils/utils';
import styles from './PlantHeader.module.scss';
import { varietiesAtom } from 'atoms/atoms';

type Props = {
  plantObject: Plant;
  plantDetails: PlantDetails;
};

export const PlantHeader = ({ plantDetails, plantObject }: Props) => {
  const setObjects = useUpdateAtom(objectsAtom);

  const varieties = useAtomValue(varietiesAtom);

  const [showVarietySelect, setShowVarietySelect] = useState(false);

  useEffect(() => {
    return () => setShowVarietySelect(false);
  }, [plantObject.id]);

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
    setShowVarietySelect(false);

    if (variety.id) {
      setObjects({
        type: 'updateSingle',
        payload: {
          object: {
            varietyId: variety.id,
          },
          id: plantObject.id,
        },
      });
    }
  };

  const varietyName = varieties?.find(
    ({ id }) => id === plantObject.varietyId
  )?.name;

  return (
    <div className={styles.header}>
      {!showVarietySelect && (
        <h4 className={Classes.HEADING} style={{ margin: 0 }}>
          {getPlantName(plantDetails.name, varietyName)}
        </h4>
      )}
      {showVarietySelect ? (
        <Suggest
          inputValueRenderer={inputValueRenderer}
          items={varieties}
          itemRenderer={itemRenderer}
          itemPredicate={itemPredicate}
          onItemSelect={onItemSelect}
          inputProps={{
            placeholder: 'Sorte auswählen',
            autoFocus: true,
            small: true,
            onBlur: () => {
              setShowVarietySelect(false);
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
};
