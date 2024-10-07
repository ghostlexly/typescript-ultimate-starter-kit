import {
  NearestMinutes,
  add,
  format,
  isAfter,
  isBefore,
  isSameHour,
  isSameMinute,
  isSunday,
  isSameMonth,
  isValid,
  parse,
  parseISO,
  roundToNearestMinutes,
  sub,
  startOfDay,
  intervalToDuration,
  differenceInMinutes,
  endOfMonth,
} from "date-fns";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
setDefaultOptions({ locale: fr });

/**
 * Generate intervals between startTime and endTime to nearest minutes (each 30 minutes)
 *
 * @param startTime
 * @param endTime
 * @param nearestTo Nearest minutes (ex: each 15 minutes)
 * @example [ "08:00", "08:30", "09:00", "09:30", "10:00", "10:30" ]
 */
const eachTimeOfInterval = (
  startTime: Date,
  endTime: Date,
  nearestTo: NearestMinutes = 30
): string[] => {
  const output: string[] = [];
  let start = startTime;
  const end = endTime;

  // --------------------------------
  // add the first interval
  // --------------------------------
  output.push(start.toISOString());

  // --------------------------------
  // add the other intervals
  // --------------------------------
  while (
    dateFns.isBefore(start, end) ||
    (dateFns.isSameHour(start, end) && dateFns.isSameMinute(start, end))
  ) {
    // round the start time to the nearest quarter minutes
    const roundedToQuarterMinutes = dateFns.roundToNearestMinutes(start, {
      nearestTo: nearestTo,
    });

    // verify if the interval is not already in the output
    if (output.includes(roundedToQuarterMinutes.toISOString()) === false) {
      // add the interval to the output
      output.push(roundedToQuarterMinutes.toISOString());
    }

    // increment the start time
    start = dateFns.add(roundedToQuarterMinutes, { minutes: nearestTo });
  }

  return output;
};

/**
 * Count number of business hours between two dates
 */
const countWeekdayMinutes = ({ startDate, endDate }) => {
  let weekdayMinutes = 0;
  let actualDate = startDate;

  while (dateFns.isBefore(actualDate, endDate)) {
    if (!isSunday(actualDate)) {
      const hourOfDay = actualDate.getHours();

      // In UTC time, 4h (UTC) is 5h in Paris (UTC+1)
      // In UTC time, 22h (UTC) is 23h in Paris (UTC+1)
      if (hourOfDay >= 4 && hourOfDay < 22) {
        weekdayMinutes++;
      }
    }

    actualDate = dateFns.add(actualDate, { minutes: 1 });
  }

  return weekdayMinutes;
};

/**
 * Count number of night minutes between two dates
 */
const countNightMinutes = ({ startDate, endDate }) => {
  let nightMinutes = 0;
  let actualDate = startDate;

  while (dateFns.isBefore(actualDate, endDate)) {
    if (!isSunday(actualDate)) {
      const hourOfDay = actualDate.getHours();

      // In UTC time, 4h (UTC) is 5h in Paris (UTC+1)
      // In UTC time, 22h (UTC) is 23h in Paris (UTC+1)
      if (hourOfDay >= 22 || hourOfDay < 4) {
        nightMinutes++;
      }
    }

    actualDate = dateFns.add(actualDate, { minutes: 1 });
  }

  return nightMinutes;
};

/**
 * Count number of sunday (dimanche) minutes between two dates
 */
const countSundayHolidayMinutes = ({ startDate, endDate }) => {
  let sundayHolidayMinutes = 0;
  let actualDate = startDate;

  while (dateFns.isBefore(actualDate, endDate)) {
    if (isSunday(actualDate)) {
      sundayHolidayMinutes++;
    }

    actualDate = dateFns.add(actualDate, { minutes: 1 });
  }

  return sundayHolidayMinutes;
};

export const dateFns = {
  add,
  sub,
  format,
  isBefore,
  isAfter,
  isSameHour,
  isSameMinute,
  roundToNearestMinutes,
  parse,
  parseISO,
  isValid,
  startOfDay,
  intervalToDuration,
  differenceInMinutes,
  endOfMonth,
  isSameMonth,

  // custom functions
  eachTimeOfInterval,
  countWeekdayMinutes,
  countNightMinutes,
  countSundayHolidayMinutes,
};
