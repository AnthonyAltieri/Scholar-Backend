/**
 * @author Anthony Altieri on 12/29/16.
 */

import moment from 'moment-timezone';

export function isSameDay(a, b) {
  const aArray = a.format('L').split('/');
  const bArray = b.format('L').split('/');
  const aYear = parseInt(aArray[2]);
  const bYear = parseInt(bArray[2]);
  const aMonth = parseInt(aArray[1]);
  const bMonth = parseInt(bArray[1]);
  const aDay = parseInt(aArray[0]);
  const bDay = parseInt(bArray[0]);
  return (aYear === bYear && aMonth === bMonth && aDay === bDay);
}

export function shouldCreateNewCourseSession(created, timeZone) {
  const now = new Date();
  const momentNow = typeof timeZone !== 'undefined'
    ? moment(now).tz(timeZone)
    : moment(now);
  const momentCreated = typeof timeZone !== 'undefined'
    ? moment(created).tz(timeZone)
    : moment(created);
  return !(isSameDay(momentNow, momentCreated.startOf('day'))
    && isSameDay(momentNow, momentCreated.endOf('day')));
}
