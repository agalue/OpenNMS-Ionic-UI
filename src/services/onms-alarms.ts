import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsAlarm } from '../models/onms-alarm';
import { OnmsAck } from '../models/onms-ack';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsAlarmsService {

  alarmsPerPage: number = 20;

  constructor(private http: HttpService) {}

  getAlarms(start: number = 0, filter: string = null) : Promise<OnmsAlarm[]> {
    let url = `/rest/alarms?order=desc&orderBy=lastEventTime&offset=${start}&limit=${this.alarmsPerPage}`;
    if (filter) {
      url += `&comparator=ilike&description=%25${filter}%25`;
    }
    return new Promise<OnmsAlarm[]>((resolve, reject) =>
      this.http.get(url)
        .map((response: Response) =>  OnmsAlarm.importAlarms(response.json().alarm))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
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
    let ackRequest = `alarmId=${alarmId}&action=${action}`;
    return new Promise<OnmsAck>((resolve, reject) =>
      this.http.post('/rest/acks', 'application/x-www-form-urlencoded', ackRequest)
        .map((response: Response) =>  OnmsAck.importAck(response.json()))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

}