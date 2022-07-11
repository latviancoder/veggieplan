import { objectsInMetersAtom } from './../atoms/objectsAtom';
import { canvasAtom, modeAtom, plotAtom, varietiesAtom } from 'atoms/atoms';
import deepEqual from 'deep-equal';
import { useAtomValue } from 'jotai/utils';
import isEmpty from 'lodash.isempty';
import sortBy from 'lodash.sortby';
import { useEffect, useRef, useLayoutEffect } from 'react';
import { useMutation } from 'react-query';
import { Config, GardenObject, Modes, Variety } from 'types';
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

  console.log({ objects, config, varieties });

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

  // console.log(prevConfig.current);

  useEffect(() => {
    if (
      prevConfig.current !== undefined &&
      !deepEqual(prevConfig.current, config)
    ) {
      console.log(prevConfig.current, config);
      saveConfig(config);
    }

    prevConfig.current = config;
  }, [config, saveConfig]);

  // Autosave doesn't get triggered for volatile state changes like movement and resizing.
  // Additionally there is a debounce.
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
          const deletedObjectIds = prevSavedObjects.current
            ?.filter(
              ({ id }) => !objects.find(({ id: deletedId }) => id === deletedId)
            )
            .map(({ id }) => id);

          const changedObjects = objects.filter((obj) => {
            if (
              !deepEqual(
                { ...obj, zIndex: undefined },
                {
                  ...prevSavedObjects.current?.find(({ id }) => id === obj.id),
                  zIndex: undefined,
                }
              )
            ) {
              return true;
            }

            return false;
          });

          saveObjects({ changedObjects, deletedObjectIds });

          prevSavedObjects.current = objects;
        }
      }, 2000);
    }

    if (prevSavedObjects.current === undefined) {
      prevSavedObjects.current = objects;
    }
  }, [mode, objects, saveObjects, prevSavedObjects, canvas]);
};
