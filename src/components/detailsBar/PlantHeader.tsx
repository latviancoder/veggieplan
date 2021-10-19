import produce from 'immer';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import {
  Button,
  Classes,
  MenuItem,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Suggest } from '@blueprintjs/select';

import { objectsAtom } from '../../atoms/objectsAtom';
import { selectedObjectIdsAtom } from '../../atoms/selectedObjectIdsAtom';
import { Plant, PlantDetails } from '../../types';
import { isPlant, post } from '../../utils';
import styles from './PlantHeader.module.scss';

type Props = {
  selectedObject: Plant;
  plantDetails: PlantDetails;
};

type Variety = {
  id?: number;
  name: string;
  plantId: number;
};

export const PlantHeader = ({ plantDetails, selectedObject }: Props) => {
  const [objects, setObjects] = useAtom(objectsAtom);

  const { data: varieties, refetch } = useQuery<Variety[]>(
    ['varieties', plantDetails.id],
    () => fetch(`/api/varieties/${plantDetails.id}`).then((res) => res.json())
  );

  const { mutate: saveVariety } = useMutation<Variety, string, Variety>(
    (variety) => post('/api/varieties', variety).then((r) => r.json()),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const [showVarietySelect, setShowVarietySelect] = useState(false);

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

    // todo refactor setting of objects? move to atom?
    setObjects({
      objects: produce(objects, (draft) => {
        const i = objects.findIndex(({ id }) => id === selectedObject.id);
        (draft[i] as Plant).varietyId = variety.id;
      }),
    });
  };

  const varietyName = varieties?.find(
    ({ id }) => id === selectedObject.varietyId
  )?.name;

  return (
    <div className={styles.header}>
      {!showVarietySelect && (
        <h4 className={Classes.HEADING} style={{ margin: 0 }}>
          {plantDetails.name}
          {varietyName ? `, ${varietyName}` : ''}
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
