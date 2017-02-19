import { Injectable } from '@angular/core';

import { OnmsEvent } from '../models/onms-event';
import { OnmsAlarm } from '../models/onms-alarm';
import { OnmsOutage } from '../models/onms-outage';
import { OnmsSeverities } from '../models/onms-severities';

@Injectable()
export class OnmsUIService {

  getFormattedUei(uei: string) {
    let ret: string = uei.replace(/^.*\//g, '');
    ret = ret.search(/_/) == -1 ? ret.replace(/([A-Z])/g, ' $1') : ret.replace('_', ' ');
    return ret.charAt(0).toUpperCase() + ret.slice(1);
  }

  getOutageIconColor(outage: OnmsOutage, strong: boolean = false) {
    return outage.getSeverity() + (strong ? '_' : '');
  }

  getEventIcon(event: OnmsEvent) {
    const index = OnmsSeverities.getIndex(event.severity);
    if (index > 5)
      return 'flame';
    if (index > 3)
      return 'warning';
    return 'alert';
  }

  getEventIconColor(event: OnmsEvent) {
    return event.severity + '_';
  }

   getAlarmIconColor(alarm: OnmsAlarm) {
    return alarm.severity + '_';
  }

  getAlarmIcon(alarm: OnmsAlarm) {
    const index = OnmsSeverities.getIndex(alarm.severity);
    if (index > 5)
      return 'flame';
    if (index > 3)
      return 'warning';
    return 'alert';
  }

}