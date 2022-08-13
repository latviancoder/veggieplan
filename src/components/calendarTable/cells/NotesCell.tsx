import { Classes, Dialog, TextArea } from '@blueprintjs/core';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useEffect, useRef, useState } from 'react';

import { objectsAtom, varietiesAtom } from 'atoms';
import { getPlantName } from 'utils/utils';

import { Row } from '../CalendarTable';
import styles from './NotesCell.module.scss';

type Props = {
  data: Row;
};

export const NotesCell = ({ data }: Props) => {
  const setObjects = useUpdateAtom(objectsAtom);
  const varieties = useAtomValue(varietiesAtom);

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState(data.notes || '');

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Place cursor at the end of textarea on render
      setTimeout(() => {
        textRef.current?.focus();
        textRef.current?.setSelectionRange(99999, 99999);
      }, 0);
    }
  }, [isOpen]);

  const onBlur = () => {
    setObjects({
      type: 'updateSingle',
      payload: {
        object: {
          notes: value,
        },
        id: data.id,
      },
    });
  };

  const varietyName = varieties?.find(({ id }) => id === data.varietyId)?.name;

  return (
    <>
      <Dialog
        title={getPlantName(data.plantName, varietyName)}
        isCloseButtonShown
        isOpen={isOpen}
        transitionDuration={0}
        onClose={() => setOpen(false)}
      >
        <p className={Classes.DIALOG_BODY}>
          <TextArea
            growVertically
            inputRef={textRef}
            fill
            value={value}
            // TODO
            // Enter not working in textareas opened from dialogs which are in tables
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
          />
        </p>
      </Dialog>
      <div className={styles.root} onClick={(e) => setOpen(true)}>
        <div className={styles.inside}>{value}</div>
      </div>
    </>
  );
};
