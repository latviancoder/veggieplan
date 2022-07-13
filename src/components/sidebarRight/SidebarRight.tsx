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
  useUtils,
} from '../../utils/utils';
import styles from './SidebarRight.module.scss';
import { PlantAmountRow } from './PlantAmountRow';
import { PlantDates } from './PlantDates';
import { PlantHeader } from './PlantHeader';
import { PlantSpacing } from './PlantSpacing';
import { ShapeHeader } from './ShapeHeader';
import { PlotDetails } from './PlotDetails';

type Props = {
  selectedObject: GardenObject;
  plantDetails?: PlantDetails;
};

const SidebarRight = memo(({ selectedObject, plantDetails }: Props) => {
  const { width, height } = selectedObject;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {plantDetails && isPlant(selectedObject) ? (
          <PlantHeader
            objectId={selectedObject.id}
            plantId={selectedObject.plantId}
            varietyId={selectedObject.varietyId}
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
            id={selectedObject.id}
            dateStartIndoors={selectedObject.dateStartIndoors}
            dateTransplant={selectedObject.dateTransplant}
            dateDirectSow={selectedObject.dateDirectSow}
            dateFirstHarvest={selectedObject.dateFirstHarvest}
            dateLastHarvest={selectedObject.dateLastHarvest}
          />
        </>
      )}
    </div>
  );
});

SidebarRight.displayName = 'SidebarRight';

export const SidebarRightConnected = () => {
  const { getPlantDetails } = useUtils();
  const objects = useAtomValue(objectsInMetersAtom);
  const selectedObjectIds = useAtomValue(selectedObjectIdsAtom);

  const lastSelectedId = selectedObjectIds[selectedObjectIds.length - 1];

  const selectedObject = objects.find(({ id }) => id === lastSelectedId);

  if (!selectedObject) return <PlotDetails />;

  if (!isRectangular(selectedObject)) return null;

  const plantDetails = isPlant(selectedObject)
    ? getPlantDetails(selectedObject)
    : undefined;

  return (
    <SidebarRight plantDetails={plantDetails} selectedObject={selectedObject} />
  );
};
