import { hiddenObjectIdsAtom } from './atoms';
import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';
import { objectsAtom } from './objectsAtom';
import { isPlant, isPlantOverlappingDateRange } from 'utils/utils';

const _selectedDatesAtom = atom<null | {
  start: string;
  end: string;
}>(null);

export const selectedDatesAtom = atom<
  null | {
    start: Date;
    end: Date;
  },
  {
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
  (get, set, { start, end }) => {
    const objects = get(objectsAtom);

    // Defining hidden objects here is more performance than inside objectsAtom
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
