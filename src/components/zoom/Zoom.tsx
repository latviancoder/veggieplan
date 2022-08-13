import { Button, Icon } from '@blueprintjs/core';
import { useUpdateAtom } from 'jotai/utils';

import { zoomAtom } from 'atoms';

import styles from './Zoom.module.css';

export const Zoom = () => {
  const setZoom = useUpdateAtom(zoomAtom);

  return (
    <div className={styles.container}>
      <Button onClick={() => setZoom({ direction: 'zoomIn', withTween: true })}>
        <Icon icon="plus" />
      </Button>
      <Button
        onClick={() => setZoom({ direction: 'zoomOut', withTween: true })}
      >
        <Icon icon="minus" />
      </Button>
    </div>
  );
};
