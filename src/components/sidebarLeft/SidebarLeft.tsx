import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';

import {
  Button,
  ButtonGroup,
  Icon,
  Position,
  Tooltip
} from '@blueprintjs/core';

import { ReactComponent as BroccoliIcon } from '../../assets/broccoli.svg';
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
          content={<span>Auswahlwerkzeug</span>}
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
        <Tooltip content={<span>Beet</span>} position={Position.RIGHT}>
          <Button
            onClick={() => {
              setMode(Modes.CREATION);
              setSelectedPlant(null);
            }}
            active={mode === Modes.CREATION && !selectedPlant}
          >
            <Icon icon="square" />
          </Button>
        </Tooltip>
        {plants?.map(({ id, name }) => (
          <Tooltip key={id} content="Gemüse" position={Position.RIGHT}>
            <Button style={{ padding: '5px 7px' }} onClick={() => {}}>
              <BroccoliIcon width={16} height={16} fill="#5c7080" />
            </Button>
          </Tooltip>
        ))}
        {/* {plants?.map(({ id, name }) => (
          <Tooltip key={id} content="Gemüse" position={Position.RIGHT}>
            <Button
              style={{ padding: '5px 7px' }}
              onClick={() => {
                setMode(Modes.CREATION);
                setSelectedPlant(id);
              }}
              active={mode === Modes.CREATION && selectedPlant === id}
            >
              <BroccoliIcon width={16} height={16} fill="#5c7080" />
            </Button>
          </Tooltip>
        ))} */}
      </ButtonGroup>
    </aside>
  );
};
