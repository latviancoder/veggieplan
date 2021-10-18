import { useAtomValue } from 'jotai/utils';

import { Classes, Colors } from '@blueprintjs/core';

import { objectsAtom } from '../../atoms/objectsAtom';
import { selectedObjectIdsAtom } from '../../atoms/selectedObjectIdsAtom';
import {
  isPlant,
  isRectangular,
  roundTwoDecimals,
  useUtils
} from '../../utils';
import styles from './DetailsBar.module.scss';
import { PlantAmountRow } from './PlantAmountRow';
import { PlantHeader } from './PlantHeader';

export const DetailsBar = () => {
  const { pxToMeter, getPlant } = useUtils();
  const objects = useAtomValue(objectsAtom);
  const selectedObjectIds = useAtomValue(selectedObjectIdsAtom);

  // todo add some kind of information for multiple selection?
  const lastSelectedId = selectedObjectIds[selectedObjectIds.length - 1];

  const selectedObject = objects.find(({ id }) => id === lastSelectedId);

  if (!selectedObject) return <div className={styles.root} />;

  if (!isRectangular(selectedObject)) return null;

  const plant = isPlant(selectedObject)
    ? getPlant(selectedObject.plantId)
    : undefined;

  const { width, height } = selectedObject;

  const widthInMeter = pxToMeter(width);
  const heightInMeter = pxToMeter(height);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {plant && <PlantHeader plant={plant} />}
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
      </div>
      {plant && (
        <PlantAmountRow
          plant={plant}
          width={selectedObject.width}
          height={selectedObject.height}
        />
      )}
    </div>
  );
};
