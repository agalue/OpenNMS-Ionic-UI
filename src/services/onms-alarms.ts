import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsAlarm } from '../models/onms-alarm';
import { OnmsAlarmStats } from '../models/onms-alarm-stats';
import { OnmsAck } from '../models/onms-ack';
import { OnmsApiFilter, AlarmOptions } from '../models/onms-api-filter';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsAlarmsService {

  constructor(private http: HttpService) {}

  getAlarmCount() : Promise<number> {
    return this.http.get('/rest/alarms/count', '*/*')
      .map((response: Response) => parseInt(response.text()))
      .toPromise()
  }

  getAlarms(start: number = 0, options: AlarmOptions, filters: OnmsApiFilter[] = []) : Promise<OnmsAlarm[]> {
    let order = options.newestFirst ? 'desc' : 'asc';
    let url = `/rest/alarms?order=${order}&orderBy=lastEventTime&offset=${start}&limit=${options.limit}`;
    filters.push(new OnmsApiFilter('alarmAckUser', options.showAcknowledged ? 'notnull' : 'null'));
    if (filters.length > 0) {
      url += `&comparator=ilike&${OnmsApiFilter.encodeFilters(filters)}`
    }
    return this.http.get(url)
      .map((response: Response) =>  OnmsAlarm.importAlarms(response.json().alarm))
      .toPromise()
  }

  getStatistics() : Promise<OnmsAlarmStats[]> {
    return this.http.get('/rest/stats/alarms/by-severity')
      .map((response: Response) =>  OnmsAlarmStats.importAll(response.json().alarmStatistics))
      .toPromise()
  }

  acknowledgeAlarm(alarm: OnmsAlarm) : Promise<OnmsAck> {
    return this.requestAcknodwledge(alarm.id, 'ack');
  }

  unacknowledgeAlarm(alarm: OnmsAlarm) : Promise<OnmsAck> {
    return this.requestAcknodwledge(alarm.id, 'unack');
  }

  clearAlarm(alarm: OnmsAlarm) : Promise<OnmsAck> {
    return this.requestAcknodwledge(alarm.id, 'clear');
  }

  escalateAlarm(alarm: OnmsAlarm) : Promise<OnmsAck> {
    return this.requestAcknodwledge(alarm.id, 'esc');
  }

  private requestAcknodwledge(alarmId: number, action: string) : Promise<OnmsAck> {
    const ackRequest = `alarmId=${alarmId}&action=${action}`;
    return this.http.post('/rest/acks', 'application/x-www-form-urlencoded', ackRequest)
      .map((response: Response) =>  OnmsAck.importAck(response.json()))
      .toPromise()
  }

}