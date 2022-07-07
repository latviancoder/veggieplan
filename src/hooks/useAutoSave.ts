import { objectsInMetersAtom } from './../atoms/objectsAtom';
import { canvasAtom, modeAtom, plotAtom, varietiesAtom } from 'atoms/atoms';
import deepEqual from 'deep-equal';
import { useAtomValue } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import sortBy from 'lodash.sortby';
import { useEffect, useRef, useLayoutEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Config, GardenObject, Modes, Variety } from 'types';
import { post, put } from 'utils/utils';

let timeout: NodeJS.Timeout;

export const useAutosave = () => {
  const canvas = useAtomValue(canvasAtom);
  const mode = useAtomValue(modeAtom);
  const objects = useAtomValue(objectsInMetersAtom);
  const config = useAtomValue(plotAtom);
  const varieties = useAtomValue(varietiesAtom);

  const { isLoading: isObjectsLoading, data: objectsFromDb } = useQuery<
    GardenObject[]
  >('objects', () => fetch('/api/objects').then((res) => res.json()));

  const { data: configFromDb } = useQuery<Config>('config', () =>
    fetch('/api/config').then((res) => res.json())
  );

  const prevObjects = useRef<GardenObject[] | undefined>();
  const prevConfig = useRef<Config | undefined>();
  const prevVarieties = useRef<Variety[] | undefined>();

  useLayoutEffect(() => {
    prevObjects.current = objectsFromDb;
  }, [objectsFromDb]);

  const { mutate: saveObjects } = useMutation<
    unknown,
    unknown,
    { changedObjects: GardenObject[]; deletedObjectIds: string[] | undefined }
  >(({ changedObjects, deletedObjectIds }) => {
    return post('/api/objects/save', {
      changedObjects,
      deletedObjectIds,
    });
  });

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
