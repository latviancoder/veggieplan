import { Spinner } from '@blueprintjs/core';
import { PropsWithChildren, useEffect, useState } from 'react';

import styles from './Loader.module.scss';

const MAX_DURATION = 150;

type Props = PropsWithChildren & {
  'aria-label': string;
};

export const Loader = ({ children, ...rest }: Props) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowLoading(true), MAX_DURATION);
    return () => clearTimeout(timeout);
  }, []);

  if (!showLoading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Spinner {...rest} intent="primary" size={50} />
        {children}
      </div>
    </div>
  );
};
