import * as moment from 'moment-timezone';

const DEFAULT_TIMEZONE = 'America/Guayaquil';

export class Util {
  static getCurrentTimestamp(): number {
    return moment.tz(DEFAULT_TIMEZONE).valueOf();
  }
}
