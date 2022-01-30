import { modeAtom, plantsAtom, selectedPlantAtom } from 'atoms/atoms';
import classnames from 'classnames';
import Fuse from 'fuse.js';
import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useEffect, useRef, useState } from 'react';
import { Modes, PlantDetails } from 'types';

import {
  Button,
  FormGroup,
  Icon,
  InputGroup,
  Position,
  Tooltip
} from '@blueprintjs/core';

import styles from './PlantsSearch.module.scss';

export const PlantsSearch = () => {
  const fuseRef = useRef<Fuse<PlantDetails>>();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const setMode = useUpdateAtom(modeAtom);
  const [selectedPlant, setSelectedPlant] = useAtom(selectedPlantAtom);
  const plants = useAtomValue(plantsAtom);

  useEffect(() => {
    fuseRef.current = new Fuse(plants, {
      threshold: 0.1,
      includeMatches: true,
      keys: [
        'name',
        {
          name: 'alternativeNames',
          weight: 2,
        },
      ],
    });
  }, [plants]);

  let searchResult = searchQuery
    ? fuseRef.current?.search(searchQuery).map(({ item, matches }) => {
        return item;
      })
    : plants;

  return (
    <div className={styles.plantsSearch}>
      <div className={styles.search}>
        <FormGroup label={'Kulturen'} labelFor="search" style={{ margin: 0 }}>
          <div className={styles.flex}>
            <InputGroup
              fill
              autoComplete="off"
              inputRef={searchRef}
              id="search"
              leftElement={<Icon icon="search" />}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, Familie"
            />
            <div className={styles.add}>
              <Tooltip content={<span></span>} position={Position.RIGHT}>
                <Button
                  icon="plus"
                  onClick={() => {
                    console.log('lul');
                  }}
                />
              </Tooltip>
            </div>
          </div>
        </FormGroup>
      </div>
      <div className={styles.overflow}>
        <div className={styles.list}>
          {searchResult?.map(({ name, id }) => (
            <div
              tabIndex={0}
              role="button"
              className={classnames(styles.plant, {
                [styles.plantSelected]: selectedPlant === id,
              })}
              key={id}
              onClick={() => {
                setSelectedPlant(id);
                setMode(Modes.CREATION);
              }}
            >
              <img
                draggable={false}
                src={`image/${id}.png`}
                alt={name}
                className={styles.icon}
              />
              <div
                className={styles.name}
                dangerouslySetInnerHTML={{
                  __html:
                    searchQuery.length > 1
                      ? name.replace(
                          new RegExp(`(${searchQuery})`, 'gi'),
                          `<strong>$1</strong>`
                        )
                      : name,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
