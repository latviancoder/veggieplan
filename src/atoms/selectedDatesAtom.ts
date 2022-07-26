import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';

const _selectedDatesAtom = atomWithStorage<null | {
  start: string;
  end: string;
}>('selected-dates', null);

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
  (_, set, { start, end }) => {
    set(_selectedDatesAtom, {
      start: start.toDateString(),
      end: end.toDateString(),
    });
  }
);
