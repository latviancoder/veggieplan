import { useUpdateAtom } from 'jotai/utils';
import { memo, useState } from 'react';

import { Button, ButtonGroup, Position } from '@blueprintjs/core';

import { ReactComponent as LeafIcon } from '../../assets/leaf.svg';
import { modeAtom, selectedPlantAtom } from '../../atoms/atoms';
import { Modes } from '../../types';
import { PlantsSearch } from './plantsSearch/PlantsSearch';
import styles from './SidebarLeft.module.scss';
import { Tooltip2 } from '@blueprintjs/popover2';

export const SidebarLeft = memo(() => {
  const setMode = useUpdateAtom(modeAtom);
  const setSelectedPlant = useUpdateAtom(selectedPlantAtom);

  const [plantsSearch, setPlantsSearch] = useState(true);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ButtonGroup vertical minimal>
          <Tooltip2
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
          </Tooltip2>
          <Tooltip2 content={<span>Beet</span>} position={Position.RIGHT}>
            <Button
              icon="square"
              onClick={() => {
                setMode(Modes.CREATION);
                setSelectedPlant(null);
              }}
            />
          </Tooltip2>
          <Tooltip2 content="Kulturen" position={Position.RIGHT}>
            <Button
              style={{ padding: '5px 7px' }}
              onClick={() => setPlantsSearch(!plantsSearch)}
              active={plantsSearch}
            >
              <LeafIcon width={16} height={16} fill="#5c7080" />
            </Button>
          </Tooltip2>
        </ButtonGroup>
      </nav>
      {plantsSearch && (
        <>
          <PlantsSearch />
        </>
      )}
    </aside>
  );
});
