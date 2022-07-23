import { objectsAtom } from 'atoms/objectsAtom';
import classNames from 'classnames';
import {
  addMonths,
  differenceInMonths,
  format,
  isValid,
  max,
  min,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { useAtomValue } from 'jotai/utils';
import compact from 'lodash.compact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isPlant } from 'utils/utils';

import {
  DndContext,
  Modifier,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import styles from './MonthsSelector.module.scss';

const GRID_SIZE = 50;
const HANDLER_SIZE = 10;

export function constraintMovementModifier(
  initial: number,
  monthsCount: number,
  collisionComparator: (n: number) => { isColliding: boolean; diff: number }
): Modifier {
  return (event) => {
    const { transform } = event;

    let after = transform.x;

    if (after + initial < 0) {
      after = -initial;
    }

    if (after + initial >= monthsCount * GRID_SIZE) {
      after = GRID_SIZE * monthsCount - initial;
    }

    if (collisionComparator(after + initial).isColliding) {
      after -= collisionComparator(after + initial).diff;
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

  const [dimensions, setDimensions] = useState<{
    width: Number;
    height: number;
  } | null>(null);
  const objects = useAtomValue(objectsAtom);
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();

      setDimensions({ width, height });
    }
  }, []);

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

  const [initial1, setInitial1] = useState(0);
  const [translate1, setTranslate1] = useState(0);

  const [initial2, setInitial2] = useState(GRID_SIZE * months.length);
  const [translate2, setTranslate2] = useState(GRID_SIZE * months.length);

  const modifier1 = useCallback(() => {
    return constraintMovementModifier(
      initial1,
      months.length,
      (handlerPosition: number) => ({
        isColliding: handlerPosition >= initial2 - HANDLER_SIZE,
        diff: handlerPosition - initial2 + HANDLER_SIZE,
      })
    );
  }, [initial1, months.length, initial2]);

  const modifier2 = useCallback(() => {
    return constraintMovementModifier(
      initial2,
      months.length,
      (handlerPosition: number) => ({
        isColliding: handlerPosition <= initial1 + HANDLER_SIZE,
        diff: handlerPosition - initial1 - HANDLER_SIZE,
      })
    );
  }, [initial2, months.length, initial1]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inner}>
        <DndContext
          modifiers={[modifier1()]}
          sensors={sensors}
          onDragEnd={(event) => {
            setInitial1(initial1 + event.delta.x);
          }}
          onDragMove={(event) => setTranslate1(initial1 + event.delta.x)}
        >
          <Slider translate={translate1} color="red" />
        </DndContext>
        <DndContext
          modifiers={[modifier2()]}
          sensors={sensors}
          onDragEnd={(event) => {
            setInitial2(initial2 + event.delta.x);
          }}
          onDragMove={(event) => setTranslate2(initial2 + event.delta.x)}
        >
          <Slider translate={translate2} color="blue" />
        </DndContext>
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
    </div>
  );
};

export const Slider = ({
  translate,
  color,
}: {
  translate: number;
  color: string;
}) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'unique-id',
  });

  return (
    <button
      ref={setNodeRef}
      className={styles.handler}
      style={{
        transform: `translateX(${translate}px)`,
        backgroundColor: color,
        width: `${HANDLER_SIZE}px`,
      }}
      {...listeners}
      {...attributes}
    />
  );
};
