import { useAuth0 } from '@auth0/auth0-react';
import deepEqual from 'deep-equal';
import { useAtomValue } from 'jotai/utils';
import { sortBy } from 'lodash';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useMutation } from 'react-query';

import {
  modeAtom,
  objectsInMetersAtom,
  configAtom,
  varietiesAtom,
} from 'atoms';
import { useAccessToken } from 'hooks/useAccessToken';
import { Config, GardenObject, Variety } from 'types';
import { put } from 'utils/utils';

let timeout: NodeJS.Timeout;

const func = (event: any) => {
  return (event.returnValue = 'true');
};

export const useAutosave = () => {
  const { isAuthenticated } = useAuth0();
  const token = useAccessToken();

  const [changeMade, setChangeMade] = useState(false);

  // TODO
  // This fires more often than expected because of issues with changing references and memoization
  useEffect(() => {
    if (changeMade && !isAuthenticated) {
      window.addEventListener('beforeunload', func);
    } else {
      window.removeEventListener('beforeunload', func);
    }
    return () => {
      window.removeEventListener('beforeunload', func);
    };
  }, [changeMade, isAuthenticated]);

  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsInMetersAtom);
  const config = useAtomValue(configAtom);
  const varieties = useAtomValue(varietiesAtom);

  const prevSavedObjects = useRef<GardenObject[] | undefined>();
  const prevConfig = useRef<Config | undefined>();
  const prevVarieties = useRef<Variety[] | undefined>();

  const { mutate: saveObjects } = useMutation<unknown, unknown, GardenObject[]>(
    (objects) =>
      put('/api/objects', {
        body: objects,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
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

  const varietiesChanged = useCallback(
    () =>
      prevVarieties.current !== undefined &&
      !deepEqual(prevVarieties.current, varieties),
    [varieties]
  );

  const configChanged = useCallback(
    () =>
      prevConfig.current !== undefined &&
      !deepEqual(prevConfig.current, config),
    [config]
  );

  const objectsChanged = useCallback(
    () =>
      prevSavedObjects.current !== undefined &&
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
      ),
    [objects]
  );

  useLayoutEffect(() => {
    if (
      (prevSavedObjects.current !== undefined && objects) ||
      (prevVarieties.current !== undefined && varieties) ||
      (prevConfig.current !== undefined && config)
    ) {
      setChangeMade(true);
    }
  }, [objects, varieties, config]);

  useLayoutEffect(() => {
    if (varietiesChanged() && isAuthenticated) {
      saveVarieties(varieties);
    }

    prevVarieties.current = varieties;
  }, [varieties, saveVarieties, isAuthenticated]);

  useLayoutEffect(() => {
    if (configChanged() && isAuthenticated) {
      saveConfig(config);
    }

    prevConfig.current = config;
  }, [config, saveConfig, isAuthenticated]);

  useLayoutEffect(() => {
    if (prevSavedObjects.current !== undefined && isAuthenticated) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (objectsChanged()) {
          saveObjects(objects);

          prevSavedObjects.current = objects;
        }
      }, 2000);
    }

    if (prevSavedObjects.current === undefined) {
      prevSavedObjects.current = objects;
    }
  }, [mode, objects, saveObjects, prevSavedObjects, isAuthenticated]);
};
