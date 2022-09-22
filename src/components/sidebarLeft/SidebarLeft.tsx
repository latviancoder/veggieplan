import { Button, ButtonGroup, MenuItem, Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Select2 } from '@blueprintjs/select';
import { useUpdateAtom } from 'jotai/utils';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { modeAtom, selectedPlantAtom } from 'atoms';
import { Modes } from 'types';

import { ReactComponent as LeafIcon } from '../../assets/leaf.svg';
import styles from './SidebarLeft.module.scss';
import { PlantsSearch } from './plantsSearch/PlantsSearch';

const buttonSize = '39px';

export const SidebarLeft = memo(() => {
  const { t, i18n } = useTranslation();
  const setMode = useUpdateAtom(modeAtom);
  const setSelectedPlant = useUpdateAtom(selectedPlantAtom);

  const [plantsSearch, setPlantsSearch] = useState(true);

  console.log(i18n.resolvedLanguage);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <div>
          <ButtonGroup vertical minimal>
            <Tooltip2
              content={<span>{t('Selection tool')}</span>}
              position={Position.RIGHT}
            >
              <Button
                style={{ width: buttonSize, height: buttonSize }}
                icon="select"
                onClick={() => {
                  setMode(Modes.SELECTION);
                  setSelectedPlant(null);
                }}
              />
            </Tooltip2>
            <Tooltip2
              content={<span>{t('Bed')}</span>}
              position={Position.RIGHT}
            >
              <Button
                style={{ width: buttonSize, height: buttonSize }}
                icon="square"
                onClick={() => {
                  setMode(Modes.CREATION);
                  setSelectedPlant(null);
                }}
              />
            </Tooltip2>
            <Tooltip2 content={t('Species')} position={Position.RIGHT}>
              <Button
                style={{ width: buttonSize, height: buttonSize }}
                onClick={() => setPlantsSearch(!plantsSearch)}
                active={plantsSearch}
              >
                <LeafIcon width={20} height={20} fill="#5c7080" />
              </Button>
            </Tooltip2>
          </ButtonGroup>
        </div>
        <div className={styles.bottomActions}>
          <Select2<string>
            filterable={false}
            popoverProps={{ minimal: true }}
            items={['DE', 'EN']}
            itemRenderer={(item, { handleClick }) => (
              <MenuItem
                selected={item === i18n.resolvedLanguage.toUpperCase()}
                onClick={handleClick}
                text={item}
                key={item}
              />
            )}
            onItemSelect={(a) => {
              i18n.changeLanguage(a.toLowerCase());
            }}
          >
            <Button text={i18n.resolvedLanguage.toUpperCase()} />
          </Select2>
        </div>
      </nav>
      {plantsSearch && (
        <>
          <PlantsSearch />
        </>
      )}
    </aside>
  );
});
