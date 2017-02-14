import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsServer } from '../models/onms-server';
import { OnmsAlarm } from '../models/onms-alarm';
import { HttpUtilsService } from './http-utils';

import 'rxjs/Rx';

@Injectable()
export class OnmsAlarmsService {

  eventsPerPage: number = 10;

  constructor(private httpUtils: HttpUtilsService) {}

  // FIXME: Potential problem here is how to filter ack vs unack
  getAlarms(server: OnmsServer, start: number = 0, filter: string = null) : Promise<OnmsAlarm[]> {
    let url = `/rest/alarms?order=desc&orderBy=lastEventTime&offset=${start}&limit=${this.eventsPerPage}`;
    if (filter) {
      url += `&comparator=ilike&description=${filter}`;
    }
    return this.httpUtils.get(server, url)
      .map((response: Response) =>  OnmsAlarm.importAlarms(response.json().alarm))
      .toPromise();
  }

  acknowledgeAlarm(server: OnmsServer, alarm: OnmsAlarm) {
    let url = `/rest/alarms/${alarm.id}`;
    return this.httpUtils.put(server, url, {limit: 0, ack: true});
  }

  unacknowledgeAlarm(server: OnmsServer, alarm: OnmsAlarm) {
    let url = `/rest/alarms/${alarm.id}`;
    return this.httpUtils.put(server, url, {limit: 0, ack: false});
  }

  clearAlarm(server: OnmsServer, alarm: OnmsAlarm) {
    let url = `/rest/alarms/${alarm.id}`;
    return this.httpUtils.put(server, url, {limit: 0, clear: true});
  }

  escalateAlarm(server: OnmsServer, alarm: OnmsAlarm) {
    let url = `/rest/alarms/${alarm.id}`;
    return this.httpUtils.put(server, url, {limit: 0, escalate: true});
  }

}