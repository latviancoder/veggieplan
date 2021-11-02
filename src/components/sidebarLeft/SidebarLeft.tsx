import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';

import {
  Button,
  ButtonGroup,
  Icon,
  Position,
  Tooltip
} from '@blueprintjs/core';

import { modeAtom, plantsAtom, selectedPlantAtom } from '../../atoms/atoms';
import { Modes } from '../../types';
import styles from './SidebarLeft.module.scss';

export const SidebarLeft = () => {
  const plants = useAtomValue(plantsAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const [selectedPlant, setSelectedPlant] = useAtom(selectedPlantAtom);

  // console.log({ plants });

  return (
    <aside className={styles.root}>
      <ButtonGroup vertical minimal>
        <Tooltip
          content={<span>Selection tool</span>}
          position={Position.RIGHT}
        >
          <Button
            active={mode === Modes.SELECTION}
            onClick={() => {
              setMode(Modes.SELECTION);
              setSelectedPlant(null);
            }}
          >
            <Icon icon="select" />
          </Button>
        </Tooltip>
        <Button
          onClick={() => {
            setMode(Modes.CREATION);
            setSelectedPlant(null);
          }}
          active={mode === Modes.CREATION && !selectedPlant}
        >
          <Icon icon="square" />
        </Button>
        {plants?.map(({ id, name }) => (
          <Tooltip key={id} content={name} position={Position.RIGHT}>
            <Button
              onClick={() => {
                setMode(Modes.CREATION);
                setSelectedPlant(id);
              }}
              active={mode === Modes.CREATION && selectedPlant === id}
            >
              <Icon icon="tree" />
            </Button>
          </Tooltip>
        ))}
      </ButtonGroup>
    </aside>
  );
};
