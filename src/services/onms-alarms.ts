import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsServer } from '../models/onms-server';
import { OnmsAlarm } from '../models/onms-alarm';
import { OnmsAck } from '../models/onms-ack';
import { HttpUtilsService } from './http-utils';

import 'rxjs/Rx';

@Injectable()
export class OnmsAlarmsService {

  alarmsPerPage: number = 20;

  constructor(private httpUtils: HttpUtilsService) {}

  getAlarms(server: OnmsServer, start: number = 0, filter: string = null) : Promise<OnmsAlarm[]> {
    let url = `/rest/alarms?order=desc&orderBy=lastEventTime&offset=${start}&limit=${this.alarmsPerPage}`;
    if (filter) {
      url += `&comparator=ilike&description=${filter}`;
    }
    return this.httpUtils.get(server, url)
      .map((response: Response) =>  OnmsAlarm.importAlarms(response.json().alarm))
      .toPromise();
  }

  acknowledgeAlarm(server: OnmsServer, alarm: OnmsAlarm) : Promise<OnmsAck> {
    return this.requestAcknodwledge(server, alarm.id, 'ack');
  }

  unacknowledgeAlarm(server: OnmsServer, alarm: OnmsAlarm) : Promise<OnmsAck> {
    return this.requestAcknodwledge(server, alarm.id, 'unack');
  }

  clearAlarm(server: OnmsServer, alarm: OnmsAlarm) : Promise<OnmsAck> {
    return this.requestAcknodwledge(server, alarm.id, 'clear');
  }

  escalateAlarm(server: OnmsServer, alarm: OnmsAlarm) : Promise<OnmsAck> {
    return this.requestAcknodwledge(server, alarm.id, 'esc');
  }

  private requestAcknodwledge(server: OnmsServer, alarmId: number, action: string) : Promise<OnmsAck> {
    let ackRequest = `alarmId=${alarmId}&action=${action}`;
    return this.httpUtils.post(server, '/rest/acks', 'application/x-www-form-urlencoded', ackRequest)
      .map((response: Response) =>  OnmsAck.importAck(response.json()))
      .toPromise();
  }

}