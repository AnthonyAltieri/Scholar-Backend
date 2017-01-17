'use strict';

class DateUtility {
  constructor() {};

  static diffMillis(date1, date2){
      return Math.abs(date1 - date2);
  }

  static diffMins(date1, date2) {
    var diff = Math.abs(date1 - date2);
    return diff / 60 / 1000;
  }

  static diffHours(date1, date2) {
    return Math.abs(date1 - date2);
  }

  static diffMinsFromNow(date) {
    var now = new Date();
    return this.diffMins(date, now);
  }

  static diffMillisFromNow(date) {
    var now = new Date();
    return this.diffMillis(date, now);
  }
}

module.exports = DateUtility;