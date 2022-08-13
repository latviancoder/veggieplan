import { FormGroup, Icon, InputGroup } from '@blueprintjs/core';
import classnames from 'classnames';
import Fuse from 'fuse.js';
import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { escapeRegExp } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { modeAtom, plantsAtom, selectedPlantAtom } from 'atoms';
import { Modes, PlantDetails } from 'types';

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
        {
          name: 'name',
          weight: 500,
        },
        {
          name: 'alternativeNames',
          weight: 1,
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
        <FormGroup labelFor="search" style={{ margin: 0 }}>
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
          </div>
        </FormGroup>
      </div>
      <div className={styles.overflow}>
        <div className={styles.list}>
          {searchResult?.map(({ name, id, hasPicture, code }) => (
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
              <div
                title={name}
                className={styles.icon}
                style={{
                  backgroundImage: hasPicture
                    ? `url(image/${code.trim()}.png)`
                    : 'url(image/plant.png)',
                }}
              />
              <div
                className={styles.name}
                dangerouslySetInnerHTML={{
                  __html:
                    searchQuery.length > 1
                      ? name.replace(
                          new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi'),
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
