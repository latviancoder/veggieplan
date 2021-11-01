import { useAtom } from 'jotai';

import { infoAtom } from '../../atoms/infoAtom';

export const Info = () => {
  const [info] = useAtom(infoAtom);

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
