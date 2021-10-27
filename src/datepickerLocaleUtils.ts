import { DatePickerLocaleUtils } from '@blueprintjs/datetime';

const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

const MONTHS =
  'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split(
    '_'
  ) as [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ];

const FIRST_DAY = 1;

function formatDay() {
  return '';
}

function formatMonthTitle(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatWeekdayShort(i: number) {
  return WEEKDAYS_SHORT[i];
}

function formatWeekdayLong(i: number) {
  return WEEKDAYS_SHORT[i];
}

function getFirstDayOfWeek() {
  return FIRST_DAY;
}

function getMonths() {
  return MONTHS;
}

// @ts-ignore
export const localeUtils: DatePickerLocaleUtils = {
  formatDay,
  formatMonthTitle,
  formatWeekdayShort,
  formatWeekdayLong,
  getFirstDayOfWeek,
  getMonths,
};
