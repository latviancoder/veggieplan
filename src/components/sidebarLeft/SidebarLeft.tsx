import { useUpdateAtom } from 'jotai/utils';
import { useState } from 'react';

import { Button, ButtonGroup, Position, Tooltip } from '@blueprintjs/core';

import { ReactComponent as LeafIcon } from '../../assets/leaf.svg';
import { modeAtom, selectedPlantAtom } from '../../atoms/atoms';
import { Modes } from '../../types';
import { PlantsSearch } from './plantsSearch/PlantsSearch';
import styles from './SidebarLeft.module.scss';

export const SidebarLeft = () => {
  const setMode = useUpdateAtom(modeAtom);
  const setSelectedPlant = useUpdateAtom(selectedPlantAtom);

  const [plantsSearch, setPlantsSearch] = useState(true);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ButtonGroup vertical minimal>
          <Tooltip
            content={<span>Auswahlwerkzeug</span>}
            position={Position.RIGHT}
          >
            <Button
              icon="select"
              onClick={() => {
                setMode(Modes.SELECTION);
                setSelectedPlant(null);
              }}
            />
          </Tooltip>
          <Tooltip content={<span>Beet</span>} position={Position.RIGHT}>
            <Button
              icon="square"
              onClick={() => {
                setMode(Modes.CREATION);
                setSelectedPlant(null);
              }}
            />
          </Tooltip>
          <Tooltip content="Kulturen" position={Position.RIGHT}>
            <Button
              style={{ padding: '5px 7px' }}
              onClick={() => setPlantsSearch(!plantsSearch)}
              active={plantsSearch}
            >
              <LeafIcon width={16} height={16} fill="#5c7080" />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </nav>
      {plantsSearch && (
        <>
          <PlantsSearch />
        </>
      )}
    </aside>
  );
};
