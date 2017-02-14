import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsServer } from '../models/onms-server';
import { OnmsNotification } from '../models/onms-notification';
import { OnmsAck } from '../models/onms-ack';
import { HttpUtilsService } from './http-utils';

import 'rxjs/Rx';

@Injectable()
export class OnmsNotificationsService {

  notificationsPerPage: number = 20;

  constructor(private httpUtils: HttpUtilsService) {}

  getNotifications(server: OnmsServer, start: number = 0, filter: string = null) : Promise<OnmsNotification[]> {
    let url = `/rest/notifications?order=desc&orderBy=id&offset=${start}&limit=${this.notificationsPerPage}`;
    if (filter) {
      url += `&comparator=ilike&textMessage=${filter}`;
    }
    return this.httpUtils.get(server, url)
      .map((response: Response) => OnmsNotification.importNotifications(response.json().notification))
      .toPromise();
  }

  acknowledgeNotification(server: OnmsServer, notification: OnmsNotification) : Promise<OnmsAck> {
    return this.requestAcknodwledge(server, notification.id, 'ack');
  }

  unacknowledgeNotification(server: OnmsServer, notification: OnmsNotification) : Promise<OnmsAck> {
    return this.requestAcknodwledge(server, notification.id, 'unack');
  }

  private requestAcknodwledge(server: OnmsServer, notifyId: number, action: string) : Promise<OnmsAck> {
    let ackRequest = `notifId=${notifyId}&action=${action}`;
    return this.httpUtils.post(server, '/rest/acks', 'application/x-www-form-urlencoded', ackRequest)
      .map((response: Response) =>  OnmsAck.importAck(response.json()))
      .toPromise();
  }

}