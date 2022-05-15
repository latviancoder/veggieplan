import { objectsInMetersAtom } from './../atoms/objectsAtom';
import { canvasAtom, modeAtom, plotAtom } from 'atoms/atoms';
import deepEqual from 'deep-equal';
import { useAtomValue } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import sortBy from 'lodash.sortby';
import { useEffect, useRef, useLayoutEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Config, GardenObject, Modes } from 'types';
import { post } from 'utils/utils';

let timeout: NodeJS.Timeout;

// TODO works like shit
export const useAutosave = () => {
  const canvas = useAtomValue(canvasAtom);
  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsInMetersAtom);
  const config = useAtomValue(plotAtom);

  const { isLoading: isObjectsLoading, data: objectsFromDb } = useQuery<
    GardenObject[]
  >('objects', () => fetch('/api/objects').then((res) => res.json()));

  const { data: configFromDb } = useQuery<Config>('config', () =>
    fetch('/api/config').then((res) => res.json())
  );

  const prevObjects = useRef<GardenObject[] | undefined>();
  const prevConfig = useRef<Config | undefined>();

  useLayoutEffect(() => {
    prevObjects.current = objectsFromDb;
    prevConfig.current = configFromDb;
  }, [objectsFromDb, configFromDb]);

  const { mutate: saveObjects } = useMutation<
    unknown,
    string,
    { changedObjects: GardenObject[]; deletedObjectIds: string[] | undefined }
    // @ts-ignore
  >(({ changedObjects, deletedObjectIds }) => {
    return post('/api/objects/save', {
      changedObjects,
      deletedObjectIds,
    });
  });

  const { mutate: saveConfig } = useMutation<unknown, string, Config>(
    (config) => {
      return post('/api/config/save', config);
    }
  );

  useEffect(() => {
    if (!isEmpty(config) && !deepEqual(prevConfig.current, config)) {
      saveConfig(config);

      prevConfig.current = config;
    }
  }, [config, saveConfig]);

  // Autosave doesn't get triggered for volatile state changes like movement and resizing.
  // Additionally there is a debounce.
  useEffect(() => {
    if (
      !isEmpty(canvas) &&
      !isObjectsLoading &&
      mode !== Modes.MOVEMENT &&
      mode !== Modes.RESIZING &&
      mode !== Modes.ROTATION &&
      (!prevObjects ||
        !deepEqual(
          sortBy(
            objects.map((obj) => ({ ...obj, zIndex: undefined })),
            'id'
          ),
          sortBy(
            prevObjects.current?.map((obj) => ({ ...obj, zIndex: undefined })),
            'id'
          )
        ))
    ) {
      // console.log(prevObjects?.current?.[0], objects[0]);
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const deletedObjectIds = prevObjects.current
          ?.filter(
            ({ id }) => !objects.find(({ id: deletedId }) => id === deletedId)
          )
          .map(({ id }) => id);

        const changedObjects = objects.filter((obj) => {
          if (
            !deepEqual(
              { ...obj, zIndex: undefined },
              {
                ...prevObjects.current?.find(({ id }) => id === obj.id),
                zIndex: undefined,
              }
            )
          ) {
            return true;
          }

          return false;
        });

        prevObjects.current = objects;

        saveObjects({ changedObjects, deletedObjectIds });
      }, 2000);
    }
  }, [mode, objects, saveObjects, isObjectsLoading, prevObjects, canvas]);
};
