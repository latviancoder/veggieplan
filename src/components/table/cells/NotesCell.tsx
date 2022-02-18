import { useState } from 'react';

import { Classes, Dialog } from '@blueprintjs/core';

import { Row, useFetchVarieties } from '../Table';

import styles from './NotesCell.module.scss';
import { isOpen } from '@blueprintjs/core/lib/esm/components/context-menu/contextMenu';

type Props = {
  data: Row;
};

export const NotesCell = ({ data }: Props) => {
  const { data: varieties } = useFetchVarieties();

  console.log(varieties?.find(({ id }) => id === data.varietyId)?.name);

  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Dialog
        title={`${data.plantName}`}
        isCloseButtonShown
        isOpen={isOpen}
        transitionDuration={0}
        onClose={(e) => setOpen(false)}
      >
        <p className={Classes.DIALOG_BODY}>lul</p>
      </Dialog>
      <div className={styles.root} onClick={(e) => setOpen(true)}>
        <div>asd</div>
      </div>
    </>
  );
};
