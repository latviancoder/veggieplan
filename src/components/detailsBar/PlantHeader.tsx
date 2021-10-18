import { divide } from 'lodash';
import { useRef, useState } from 'react';

import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Suggest } from '@blueprintjs/select';

import { PlantDetails } from '../../types';
import styles from './PlantHeader.module.scss';

type Props = {
  plant: PlantDetails;
};

type Item = { title: string };
export const PlantHeader = ({ plant }: Props) => {
  const [showVarietySelect, setShowVarietySelect] = useState(false);
  const [variety, setVariety] = useState<Item | undefined>();

  const items: Item[] = [
    { title: 'The Godfather' },
    { title: 'The Godfather: Part II' },
    { title: 'The Dark Knight' },
    { title: '12 Angry Men' },
    { title: "Schindler's List" },
  ];

  const itemRenderer: ItemRenderer<Item> = (
    item,
    { modifiers, handleClick }
  ) => (
    <MenuItem
      active={modifiers.active}
      onClick={handleClick}
      text={item.title}
      key={item.title}
    />
  );

  const inputValueRenderer = (inputValue: Item) => inputValue.title;

  const itemPredicate: ItemPredicate<Item> = (
    query,
    item,
    index,
    exactMatch
  ) => {
    const Title = item.title.toLowerCase();
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

  return (
    <div className={styles.header}>
      {!showVarietySelect && (
        <h4 className={Classes.HEADING} style={{ margin: 0 }}>
          {plant.name}
          {variety ? `, ${variety.title}` : ''}
        </h4>
      )}
      {plant &&
        (showVarietySelect ? (
          <Suggest
            createNewItemFromQuery={(variety: string) => {
              return { title: variety };
            }}
            createNewItemRenderer={renderCreateVarietyOption}
            inputValueRenderer={inputValueRenderer}
            items={items}
            itemRenderer={itemRenderer}
            itemPredicate={itemPredicate}
            onItemSelect={(value) => {
              setShowVarietySelect(false);
              setVariety(value);
            }}
            inputProps={{
              placeholder: 'Auswählen oder neue erstellen..',
              autoFocus: true,
            }}
            popoverProps={{ minimal: true }}
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
        ))}
    </div>
  );
};
