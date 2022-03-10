import { useUpdateAtom } from 'jotai/utils';
import { ChangeEventHandler, useState } from 'react';

import { Button, Classes, InputGroup } from '@blueprintjs/core';

import { objectsAtom } from '../../atoms/objectsAtom';
import { Shape } from '../../types';
import styles from './ShapeHeader.module.scss';

type Props = {
  shape: Shape;
};

export const ShapeHeader = ({ shape }: Props) => {
  const setObjects = useUpdateAtom(objectsAtom);
  const [showTitleInput, setShowTitleInput] = useState(false);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setObjects({
      type: 'updateSingle',
      payload: {
        object: {
          title: e.target.value,
        },
        id: shape.id,
      },
    });
  };

  return (
    <div className={styles.header}>
      <h4 className={Classes.HEADING} style={{ margin: 0 }}>
        Beet
        {shape.title ? `, ${shape.title}` : ''}
      </h4>
      {showTitleInput ? (
        <div style={{ width: '150px' }}>
          <InputGroup
            placeholder="Beetbezeichnung ändern"
            small={true}
            autoFocus
            onChange={onChange}
            value={shape.title || ''}
            onBlur={() => setShowTitleInput(false)}
          />
        </div>
      ) : (
        <Button
          text="Bezeichnung"
          icon="edit"
          onClick={() => setShowTitleInput(true)}
          small
          minimal
          intent="primary"
        />
      )}
    </div>
  );
};
