import { useAuth0 } from '@auth0/auth0-react';
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
import { useAccessToken } from 'hooks/useAccessToken';
import { Config, GardenObject, Variety } from 'types';
import { put } from 'utils/utils';

let timeout: NodeJS.Timeout;

export const useAutosave = () => {
  const { isAuthenticated } = useAuth0();
  const token = useAccessToken();

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
      console.log(`Bearer ${token}`);

      return put('/api/objects', {
        body: objects,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  );

  const { mutate: saveVarieties } = useMutation<unknown, unknown, Variety[]>(
    (varieties) =>
      put('/api/varieties', {
        body: varieties,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  );

  const { mutate: saveConfig } = useMutation<unknown, unknown, Config>(
    (config) =>
      put('/api/config', {
        body: config,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  );

  useLayoutEffect(() => {
    if (
      prevVarieties.current !== undefined &&
      !deepEqual(prevVarieties.current, varieties) &&
      isAuthenticated
    ) {
      saveVarieties(varieties);
    }

    prevVarieties.current = varieties;
  }, [varieties, saveVarieties, isAuthenticated]);

  useEffect(() => {
    if (
      prevConfig.current !== undefined &&
      !deepEqual(prevConfig.current, config) &&
      isAuthenticated
    ) {
      saveConfig(config);
    }

    prevConfig.current = config;
  }, [config, saveConfig, isAuthenticated]);

  useEffect(() => {
    if (
      !isEmpty(canvas) &&
      prevSavedObjects.current !== undefined &&
      isAuthenticated
    ) {
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
  }, [mode, objects, saveObjects, prevSavedObjects, canvas, isAuthenticated]);
};
