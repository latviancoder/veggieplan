import {
  DndContext,
  Modifier,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import classNames from 'classnames';
import {
  addMonths,
  differenceInMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isValid,
  max,
  min,
  startOfMonth,
} from 'date-fns';
import { de } from 'date-fns/locale';
import deepEqual from 'deep-equal';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { compact, isEmpty } from 'lodash';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

import { objectsAtom, selectedDatesAtom } from 'atoms';
import { getTerminalDates, isPlant } from 'utils/utils';

import styles from './MonthsSelector.module.scss';

const GRID_SIZE = 50;
const HANDLER_SIZE = 5;

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

export const MonthsSelector = memo(() => {
  const prevInterval = useRef<Date[] | undefined>(undefined);

  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom);
  const [, startTransition] = useTransition();
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

  const { earliestDate, latestDate, interval } = useMemo(() => {
    const objectTerminalDates = objects.filter(isPlant).map(getTerminalDates);

    const earliest: Date | undefined = isEmpty(
      compact(objectTerminalDates.map((d) => d.earliestPlanting))
    )
      ? undefined
      : min(compact(objectTerminalDates.map((d) => d.earliestPlanting)));

    const latest: Date | undefined = isEmpty(
      compact(objectTerminalDates.map((d) => d.latestHarvest))
    )
      ? undefined
      : max(compact(objectTerminalDates.map((d) => d.latestHarvest)));

    return {
      earliestDate: earliest,
      latestDate: latest,
      interval:
        earliest && latest
          ? eachDayOfInterval({
              start: startOfMonth(earliest),
              end: endOfMonth(latest),
            })
          : undefined,
    };
  }, [objects]);

  const months: Month[] = useMemo(() => {
    if (isValid(earliestDate) && isValid(latestDate)) {
      const monthsCount = differenceInMonths(latestDate!, earliestDate!);

      return [...Array(monthsCount + 1).keys()].map((i) => {
        const d = addMonths(earliestDate!, i);
        return {
          title: format(d, 'MMM', { locale: de }),
          month: Number(format(d, 'M')),
          year: Number(format(d, 'yyyy')),
          date: d,
        };
      });
    }

    return [];
  }, [objects]);

  const prevMonths = useRef<Month[] | null>(months);
  const prevSelectedDates = useRef(selectedDates);

  const [initial1, setInitial1] = useState(0);
  const [translate1, setTranslate1] = useState(0);

  const [initial2, setInitial2] = useState(GRID_SIZE * months.length);
  const [translate2, setTranslate2] = useState(GRID_SIZE * months.length);

  // When `months` are changed from outside we need to modify translated positions of sliders
  useEffect(() => {
    if (!deepEqual(prevMonths.current, months)) {
      const intervalLength = (interval || []).length - 1;

      let index1 = interval?.findIndex(
        (d) => d.getTime() === selectedDates?.start.getTime()
      );

      if (!index1 || index1 === -1) index1 = 0;

      let index2 = interval?.findIndex(
        (d) => d.getTime() === selectedDates?.end.getTime()
      );

      if (!index2 || index2 === -1) {
        index2 = intervalLength;
      }

      // If previously all months were completely selected we maintain complete selection.
      // We don't want to confuse user when they're experimenting with planting dates,
      // and suddenly their plants start disappearing because dates selection is shrinking
      if (
        prevSelectedDates.current &&
        prevInterval.current &&
        prevSelectedDates.current.start.getTime() ===
          prevInterval.current?.[0].getTime() &&
        prevSelectedDates.current.end.getTime() ===
          prevInterval.current?.[prevInterval.current.length - 1].getTime()
      ) {
        index1 = 0;
        index2 = intervalLength;
      }

      const fullWidth = GRID_SIZE * months.length;

      setInitial1(Math.round((index1 * fullWidth) / intervalLength));
      setTranslate1(Math.round((index1 * fullWidth) / intervalLength));
      setInitial2(Math.round((index2 * fullWidth) / intervalLength));
      setTranslate2(Math.round((index2 * fullWidth) / intervalLength));
    }

    prevMonths.current = months;
    prevInterval.current = interval;
    prevSelectedDates.current = selectedDates;
  }, [months, interval, selectedDates]);

  useEffect(() => {
    if (!interval) {
      setSelectedDates(null);
      return;
    }

    const intervalLength = (interval || []).length - 1;

    const fullWidth = GRID_SIZE * months.length;

    let resultingDateIndex1 = Math.floor(
      (translate1 / fullWidth) * interval.length
    );

    let resultingDateIndex2 = Math.floor(
      (translate2 / fullWidth) * (interval.length - 1)
    );

    if (resultingDateIndex1 < 1) resultingDateIndex1 = 0;
    if (resultingDateIndex2 > intervalLength)
      resultingDateIndex2 = intervalLength;

    if (!interval[resultingDateIndex1] || !interval[resultingDateIndex2]) {
      setSelectedDates(null);
      return;
    }

    if (
      interval[resultingDateIndex1].getTime() !==
        selectedDates?.start.getTime() ||
      interval[resultingDateIndex2].getTime() !== selectedDates?.end.getTime()
    ) {
      startTransition(() => {
        // console.log({
        //   start: interval[resultingDateIndex1],
        //   end: interval[resultingDateIndex2],
        // });

        setSelectedDates({
          start: interval[resultingDateIndex1],
          end: interval[resultingDateIndex2],
        });
      });
    }
  }, [translate1, translate2, months, interval]);

  const modifier1 = useCallback(() => {
    return constraintMovementModifier(
      initial1,
      months.length,
      (handlerPosition: number) => ({
        isColliding: handlerPosition >= initial2 - HANDLER_SIZE * 2,
        diff: handlerPosition - initial2 + HANDLER_SIZE * 2,
      })
    );
  }, [initial1, months.length, initial2]);

  const modifier2 = useCallback(() => {
    return constraintMovementModifier(
      initial2,
      months.length,
      (handlerPosition: number) => ({
        isColliding: handlerPosition <= initial1 + HANDLER_SIZE * 2,
        diff: handlerPosition - initial1 - HANDLER_SIZE * 2,
      })
    );
  }, [initial2, months.length, initial1]);

  if (!months.length) return null;

  // console.log(months);
  // console.log(selectedDates);

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
          <Slider translate={translate2 - HANDLER_SIZE} color="blue" />
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
});

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
