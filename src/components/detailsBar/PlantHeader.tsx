import { useUpdateAtom } from 'jotai/utils';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Suggest } from '@blueprintjs/select';

import { objectsAtom } from '../../atoms/objectsAtom';
import { Plant, PlantDetails, Variety } from '../../types';
import { post } from '../../utils';
import styles from './PlantHeader.module.scss';

type Props = {
  plantObject: Plant;
  plantDetails: PlantDetails;
};

export const PlantHeader = ({ plantDetails, plantObject }: Props) => {
  const setObjects = useUpdateAtom(objectsAtom);

  const { data: varieties = [], refetch } = useQuery<Variety[] | undefined>(
    ['varieties', plantDetails.id],
    () => fetch(`/api/varieties/${plantDetails.id}`).then((res) => res.json()),
    {
      suspense: false,
    }
  );

  const { mutate: saveVariety } = useMutation<Variety, string, Variety>(
    (variety) => post('/api/varieties', variety).then((r) => r.json()),
    {
      onSuccess: (variety) => {
        setObjects({
          type: 'updateSingle',
          payload: {
            object: {
              varietyId: variety.id,
            },
            id: plantObject.id,
          },
        });

        refetch();
      },
    }
  );

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

  const renderCreateVarietyOption = (
    query: string,
    active: boolean,
    handleClick: React.MouseEventHandler<HTMLElement>
  ) => (
    <MenuItem
      icon="add"
      text={`Erstellen "${query}"`}
      active={active}
      onClick={handleClick}
      shouldDismissPopover={false}
    />
  );

  const onItemSelect = (variety: Variety) => {
    setShowVarietySelect(false);

    if (!variety.id) {
      saveVariety(variety);
    }

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
          {plantDetails.name}
          {varietyName ? ` (${varietyName})` : ''}
        </h4>
      )}
      {showVarietySelect ? (
        <Suggest
          createNewItemFromQuery={(query: string) => ({
            name: query,
            plantId: plantDetails.id,
          })}
          createNewItemRenderer={renderCreateVarietyOption}
          inputValueRenderer={inputValueRenderer}
          items={varieties}
          itemRenderer={itemRenderer}
          itemPredicate={itemPredicate}
          onItemSelect={onItemSelect}
          inputProps={{
            placeholder: 'Auswählen oder neue erstellen..',
            autoFocus: true,
            small: true,
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
