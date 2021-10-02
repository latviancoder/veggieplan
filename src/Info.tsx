import { useAtomsSnapshot } from 'jotai/devtools';
import styles from './Container.module.css';
import { useAtom } from 'jotai';
import { infoAtom } from './atoms/infoAtom';
import { selectionAtom } from './atoms/selectionAtom';
import { objectsAtom } from './atoms/objectsAtom';

export const Info = () => {
  const [info] = useAtom(infoAtom);
  const [selection] = useAtom(selectionAtom);
  const [objects] = useAtom(objectsAtom);

  return (
    <div className={styles.info}>
      MR: {info?.mousePositionRelative?.x}, {info?.mousePositionRelative?.y}{' '}
      <br />
      {/* {JSON.stringify(selection)} <br />
      {JSON.stringify(objects)} */}
      {/*{Array.from(atoms).map(([atom, atomValue]) => (*/}
      {/*  <div key={`${atom}`} style={{ fontSize: '12px' }}>*/}
      {/*    {JSON.stringify(atomValue)}*/}
      {/*  </div>*/}
      {/*))}*/}
      <br />
    </div>
  );
};
