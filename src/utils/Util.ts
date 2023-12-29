import * as moment from 'moment-timezone';

const DEFAULT_TIMEZONE = 'America/Guayaquil';

export class Util {
  static getCurrentTimestamp(): number {
    return moment.tz(DEFAULT_TIMEZONE).valueOf();
  }

  static transformStringToSeconds(time: string): number {
    const [_hours, _minutes, _seconds] = time.split(':');

    const hours = parseInt(_hours, 10) || 0;
    const minutes = parseInt(_minutes, 10) || 0;

    const [_secondsParts, _milisecondsParts] = _seconds.split(',');
    const seconds = parseInt(_secondsParts, 10) || 0;
    const miliseconds = parseInt(_milisecondsParts, 10) || 0;

    return hours * 3600 + minutes * 60 + seconds + miliseconds / 1000;
  }
}
