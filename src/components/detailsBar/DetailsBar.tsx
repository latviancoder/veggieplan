import { useAtomValue } from 'jotai/utils';

import { Classes, Colors } from '@blueprintjs/core';

import { objectsAtom } from '../../atoms/objectsAtom';
import { selectedObjectIdsAtom } from '../../atoms/selectedObjectIdsAtom';
import { ObjectTypes } from '../../types';
import {
  isPlant,
  isRectangleShape,
  isRectangular,
  roundTwoDecimals,
  useUtils
} from '../../utils';
import styles from './DetailsBar.module.scss';
import { PlantAmountRow } from './PlantAmountRow';
import { PlantHeader } from './PlantHeader';
import { PlantSpacing } from './PlantSpacing';
import { ShapeHeader } from './ShapeHeader';

export const DetailsBar = () => {
  const { pxToMeter, getPlantDetails } = useUtils();
  const objects = useAtomValue(objectsAtom);
  const selectedObjectIds = useAtomValue(selectedObjectIdsAtom);

  // todo add some kind of information for multiple selection?
  const lastSelectedId = selectedObjectIds[selectedObjectIds.length - 1];

  const selectedObject = objects.find(({ id }) => id === lastSelectedId);

  if (!selectedObject) return <div className={styles.root} />;

  if (!isRectangular(selectedObject)) return null;

  const plantDetails = isPlant(selectedObject)
    ? getPlantDetails(selectedObject)
    : undefined;

  const { width, height } = selectedObject;

  const widthInMeter = pxToMeter(width);
  const heightInMeter = pxToMeter(height);

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
          {roundTwoDecimals(widthInMeter * heightInMeter)}m
        </div>
        <div>
          <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
            Breite
          </h6>
          {widthInMeter}m
        </div>
        <div>
          <h6 className={Classes.HEADING} style={{ color: Colors.GRAY3 }}>
            Höhe
          </h6>
          {heightInMeter}m
        </div>
        {isPlant(selectedObject) && <PlantAmountRow obj={selectedObject} />}
      </div>
      {plantDetails && (
        <PlantSpacing
          plantDetails={plantDetails}
          objectId={selectedObject.id}
        />
      )}
    </div>
  );
};
