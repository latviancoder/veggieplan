import { atom } from 'jotai';

import { isPlant, isPlantOverlappingDateRange } from 'utils/utils';

import { hiddenObjectIdsAtom } from './atoms';
import { objectsAtom } from './objectsAtom';

const _selectedDatesAtom = atom<null | {
  start: string;
  end: string;
}>(null);

export const selectedDatesAtom = atom<
  null | {
    start: Date;
    end: Date;
  },
  null | {
    start: Date;
    end: Date;
  }
>(
  (get) => {
    const selectedDateStrings = get(_selectedDatesAtom);

    if (!selectedDateStrings) {
      return null;
    }

    return {
      start: new Date(selectedDateStrings.start),
      end: new Date(selectedDateStrings.end),
    };
  },
  (get, set, payload) => {
    const objects = get(objectsAtom);

    if (!payload) {
      set(_selectedDatesAtom, null);
      set(hiddenObjectIdsAtom, null);
      return;
    }

    const { start, end } = payload!;

    // Defining hidden objects here is more performant than inside objectsAtom
    // on every rotation/resize/move etc.
    set(
      hiddenObjectIdsAtom,
      objects
        .filter(isPlant)
        .filter((plant) => !isPlantOverlappingDateRange(plant, { start, end }))
        .map(({ id }) => id)
    );

    set(_selectedDatesAtom, {
      start: start.toDateString(),
      end: end.toDateString(),
    });
  }
);
