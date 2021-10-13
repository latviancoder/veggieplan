import { useAtomValue } from 'jotai/utils';
import { objectsAtom } from '../../atoms/objectsAtom';
import { selectedObjectIdsAtom } from '../../atoms/selectedObjectIdsAtom';
import styles from './DetailsBar.module.scss';

export const DetailsBar = () => {
  const objects = useAtomValue(objectsAtom);
  const selectedObjectIds = useAtomValue(selectedObjectIdsAtom);

  // todo add some kind of information for multiple selection?
  const lastSelectedId = selectedObjectIds[selectedObjectIds.length - 1];

  const selectedObject = objects.find(({ id }) => id === lastSelectedId);

  console.log(selectedObjectIds);

  console.log({ selectedObject });
  return <div className={styles.root}></div>;
};
