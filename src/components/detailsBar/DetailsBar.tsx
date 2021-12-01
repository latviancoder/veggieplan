import { useAtomValue } from 'jotai/utils';
import { memo } from 'react';

import { Classes, Colors } from '@blueprintjs/core';

import { objectsInMetersAtom } from '../../atoms/objectsAtom';
import { selectedObjectIdsAtom } from '../../atoms/selectedObjectIdsAtom';
import { GardenObject, ObjectTypes, PlantDetails } from '../../types';
import {
  isPlant,
  isRectangular,
  roundTwoDecimals,
  useUtils
} from '../../utils';
import styles from './DetailsBar.module.scss';
import { PlantAmountRow } from './PlantAmountRow';
import { PlantDates } from './PlantDates';
import { PlantHeader } from './PlantHeader';
import { PlantSpacing } from './PlantSpacing';
import { ShapeHeader } from './ShapeHeader';

type Props = {
  selectedObject: GardenObject;
  plantDetails?: PlantDetails;
};

const DetailsBar = memo(({ selectedObject, plantDetails }: Props) => {
  const { width, height } = selectedObject;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {plantDetails && isPlant(selectedObject) ? (
          <PlantHeader
            plantObject={selectedObject}
            plantDetails={plantDetails}
          />
        ) : (
          selectedObject.objectType === ObjectTypes.Shape && (
            <ShapeHeader shape={selectedObject} />
          )
        )}
      </div>
      <div className={styles.threeColumns}>
        <div>
          <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
            Fläche
          </h6>
          {roundTwoDecimals(width * height)}m
        </div>
        <div>
          <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
            Breite
          </h6>
          {width}m
        </div>
        <div>
          <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
            Länge
          </h6>
          {height}m
        </div>
        {isPlant(selectedObject) && <PlantAmountRow obj={selectedObject} />}
      </div>
      {plantDetails && isPlant(selectedObject) && (
        <>
          <PlantSpacing
            plantDetails={plantDetails}
            objectId={selectedObject.id}
          />
          <PlantDates
            plantObject={selectedObject}
            plantDetails={plantDetails}
          />
        </>
      )}
    </div>
  );
});

DetailsBar.displayName = 'DetailsBar';

export const DetailsBarConnected = () => {
  const { getPlantDetails } = useUtils();
  const objects = useAtomValue(objectsInMetersAtom);
  const selectedObjectIds = useAtomValue(selectedObjectIdsAtom);

  const lastSelectedId = selectedObjectIds[selectedObjectIds.length - 1];

  const selectedObject = objects.find(({ id }) => id === lastSelectedId);

  if (!selectedObject) return <div className={styles.root} />;

  if (!isRectangular(selectedObject)) return null;

  const plantDetails = isPlant(selectedObject)
    ? getPlantDetails(selectedObject)
    : undefined;

  return (
    <DetailsBar plantDetails={plantDetails} selectedObject={selectedObject} />
  );
};
