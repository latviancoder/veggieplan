import { useAtom } from 'jotai';
import { infoAtom } from '../../atoms/infoAtom';
import { selectedObjectIdsAtom } from '../../atoms/selectedObjectIdsAtom';
import { objectsAtom } from '../../atoms/objectsAtom';

export const Info = () => {
  const [info] = useAtom(infoAtom);
  const [selection] = useAtom(selectedObjectIdsAtom);
  const [objects] = useAtom(objectsAtom);

  return null;

  return (
    <div>
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
