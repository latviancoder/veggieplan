import { objectsAtom } from 'atoms/objectsAtom';
import classNames from 'classnames';
import {
  addMonths,
  differenceInMonths,
  format,
  isValid,
  max,
  min
} from 'date-fns';
import { de } from 'date-fns/locale';
import { useAtomValue } from 'jotai/utils';
import { divide } from 'lodash';
import compact from 'lodash.compact';
import { useCallback, useMemo, useRef, useState } from 'react';
import { isPlant } from 'utils';

import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  Modifier,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import styles from './MonthsSelector.module.scss';

const GRID_SIZE = 50;

export function modifier(initial: number, monthsCount: number): Modifier {
  return ({ transform }) => {
    let after = transform.x;

    if (after + initial < 0) {
      after = -initial;
    }

    if ((after + initial) / GRID_SIZE > monthsCount - 1) {
      after = GRID_SIZE * (monthsCount - 1) - initial;
    }

    return {
      ...transform,
      x: after,
      y: 0,
    };
  };
}

type Month = {
  title: string;
  month: number;
  year: number;
};

export const MonthsSelectorContainer = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [initial, setInitial] = useState(0);
  const [translate, setTranslate] = useState(0);

  const objects = useAtomValue(objectsAtom);
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  const months: Month[] = useMemo(() => {
    const dates = objects
      .filter(isPlant)
      .map(
        ({
          dateStartIndoors,
          dateTransplant,
          dateDirectSow,
          dateFirstHarvest,
          dateLastHarvest,
        }) => {
          const si = dateStartIndoors ? new Date(dateStartIndoors) : undefined;
          const tp = dateTransplant ? new Date(dateTransplant) : undefined;
          const ds = dateDirectSow ? new Date(dateDirectSow) : undefined;
          const fh = dateFirstHarvest ? new Date(dateFirstHarvest) : undefined;
          const lh = dateLastHarvest ? new Date(dateLastHarvest) : undefined;

          const earliestDate = min(compact([si, tp, ds]));
          const latestDate = max(compact([fh, lh]));

          return { earliestDate, latestDate };
        }
      );

    const earliestDate = min(dates.map(({ earliestDate }) => earliestDate));
    const latestDate = max(dates.map(({ latestDate }) => latestDate));

    if (isValid(earliestDate) && isValid(latestDate)) {
      const monthsCount = differenceInMonths(latestDate, earliestDate);

      return [...Array(monthsCount + 1).keys()].map((i) => {
        const d = addMonths(earliestDate, i);
        return {
          title: format(d, 'MMM', { locale: de }),
          month: Number(format(d, 'M')),
          year: Number(format(d, 'yyyy')),
        };
      });
    }

    return [];
  }, [objects]);

  const snapToGridModifier = useCallback(() => {
    return modifier(initial, months.length);
  }, [initial, months.length]);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setInitial(initial + event.delta.x);
    },
    [initial]
  );

  const onDragMove = useCallback(
    (event: DragMoveEvent) => {
      setTranslate(initial + event.delta.x);
    },
    [initial]
  );

  return (
    <div className={styles.container} ref={containerRef}>
      {containerRef.current && (
        <DndContext
          modifiers={[snapToGridModifier()]}
          sensors={sensors}
          onDragEnd={onDragEnd}
          onDragMove={onDragMove}
        >
          <MonthsSelector translate={translate} months={months} />
        </DndContext>
      )}
    </div>
  );
};

export const MonthsSelector = ({
  translate,
  months,
}: {
  translate: number;
  months: Month[];
}) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'unique-id',
  });

  return (
    <div className={styles.inner}>
      <button
        ref={setNodeRef}
        className={styles.handler}
        style={{
          transform: `translateX(${translate}px)`,
          width: `${GRID_SIZE}px`,
        }}
        {...listeners}
        {...attributes}
      />
      {months.map(({ title, year, month }, i) => (
        <div
          key={`${year}-${month}`}
          className={classNames(styles.month)}
          style={{ width: `${GRID_SIZE}px` }}
        >
          {title}
        </div>
      ))}
    </div>
  );
};
