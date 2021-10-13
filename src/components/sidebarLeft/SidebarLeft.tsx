import { useAtom } from 'jotai';
import { modeAtom, plantsAtom, selectedPlantAtom } from '../../atoms/atoms';
import styles from './SidebarLeft.module.scss';
import { Modes } from '../../types';
import { useAtomValue } from 'jotai/utils';
import {
  Button,
  ButtonGroup,
  Icon,
  Position,
  Tooltip,
} from '@blueprintjs/core';

export const SidebarLeft = () => {
  const plants = useAtomValue(plantsAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const [selectedPlant, setSelectedPlant] = useAtom(selectedPlantAtom);

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
        <Button
          onClick={() => {
            console.log('lul');
          }}
        >
          <Icon icon="tree" />
        </Button>
      </ButtonGroup>
      {/* {plants?.map(({ id, name }) => (
        <Button
          key={id}
          onClick={() => {
            setMode(Modes.CREATION);
            setSelectedPlant(id);
          }}
          active={mode === Modes.CREATION && selectedPlant === id}
        >
          {name}
        </Button>
      ))} */}
    </aside>
  );
};