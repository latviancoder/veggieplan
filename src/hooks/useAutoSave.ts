import deepEqual from 'deep-equal';
import { useAtomValue } from 'jotai/utils';
import { isEmpty, sortBy } from 'lodash';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useMutation } from 'react-query';

import {
  canvasAtom,
  modeAtom,
  objectsInMetersAtom,
  plotAtom,
  varietiesAtom,
} from 'atoms';
import { Config, GardenObject, Variety } from 'types';
import { post, put } from 'utils/utils';

let timeout: NodeJS.Timeout;

export const useAutosave = () => {
  const canvas = useAtomValue(canvasAtom);
  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsInMetersAtom);
  const config = useAtomValue(plotAtom);
  const varieties = useAtomValue(varietiesAtom);

  const prevSavedObjects = useRef<GardenObject[] | undefined>();
  const prevConfig = useRef<Config | undefined>();
  const prevVarieties = useRef<Variety[] | undefined>();

  const { mutate: saveObjects } = useMutation<unknown, unknown, GardenObject[]>(
    (objects) => {
      return put('/api/objects', objects);
    }
  );

  const { mutate: saveVarieties } = useMutation<unknown, unknown, Variety[]>(
    (varieties) => put('/api/varieties', varieties)
  );

  useLayoutEffect(() => {
    if (
      prevVarieties.current !== undefined &&
      !deepEqual(prevVarieties.current, varieties)
    ) {
      saveVarieties(varieties);
    }

    prevVarieties.current = varieties;
  }, [varieties, saveVarieties]);

  const { mutate: saveConfig } = useMutation<unknown, unknown, Config>(
    (config) => post('/api/config/save', config)
  );

  useEffect(() => {
    if (
      prevConfig.current !== undefined &&
      !deepEqual(prevConfig.current, config)
    ) {
      saveConfig(config);
    }

    prevConfig.current = config;
  }, [config, saveConfig]);

  useEffect(() => {
    if (!isEmpty(canvas) && prevSavedObjects.current !== undefined) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (
          !deepEqual(
            sortBy(
              objects.map((obj) => ({ ...obj, zIndex: undefined })),
              'id'
            ),
            sortBy(
              prevSavedObjects.current?.map((obj) => ({
                ...obj,
                zIndex: undefined,
              })),
              'id'
            )
          )
        ) {
          saveObjects(objects);

          prevSavedObjects.current = objects;
        }
      }, 2000);
    }

    if (prevSavedObjects.current === undefined) {
      prevSavedObjects.current = objects;
    }
  }, [mode, objects, saveObjects, prevSavedObjects, canvas]);
};
