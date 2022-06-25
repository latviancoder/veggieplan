import { useEffect, useRef, useState } from 'react';
import { Classes, Dialog, TextArea } from '@blueprintjs/core';

import { Row, useFetchVarieties } from '../CalendarTable';

import styles from './NotesCell.module.scss';
import { getPlantName, post } from 'utils/utils';
import { useMutation } from 'react-query';
import { GardenObject } from 'types';
import { useUpdateAtom } from 'jotai/utils';
import { objectsAtom } from 'atoms/objectsAtom';

type Props = {
  data: Row;
};

export const NotesCell = ({ data }: Props) => {
  const setObjects = useUpdateAtom(objectsAtom);

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState(data.notes || '');
  const { data: varieties } = useFetchVarieties();

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

  const { mutate: save } = useMutation<unknown, string, Partial<GardenObject>>(
    (partialObj) => post(`/api/objects/${data.id}/save`, partialObj)
  );

  const onBlur = () => {
    save({ notes: value });

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
