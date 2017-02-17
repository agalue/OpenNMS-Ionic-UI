import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsAlarm } from '../models/onms-alarm';
import { OnmsAck } from '../models/onms-ack';
import { OnmsApiFilter } from '../models/onms-api-filter';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsAlarmsService {

  alarmsPerPage: number = 20;

  constructor(private http: HttpService) {}

  getAlarms(start: number = 0, filters: OnmsApiFilter[] = [], limit: number = this.alarmsPerPage) : Promise<OnmsAlarm[]> {
    let url = `/rest/alarms?order=desc&orderBy=lastEventTime&offset=${start}&limit=${limit}`;
    if (filters.length > 0) {
      url += `&comparator=ilike&${OnmsApiFilter.encodeFilters(filters)}`;
    }
    return this.http.get(url)
      .map((response: Response) =>  OnmsAlarm.importAlarms(response.json().alarm))
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