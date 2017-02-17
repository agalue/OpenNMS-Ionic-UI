import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsNotification } from '../models/onms-notification';
import { OnmsAck } from '../models/onms-ack';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsNotificationsService {

  notificationsPerPage: number = 20;

  constructor(private http: HttpService) {}

  getNotifications(start: number = 0, filter: string = null) : Promise<OnmsNotification[]> {
    let url = `/rest/notifications?order=desc&orderBy=id&offset=${start}&limit=${this.notificationsPerPage}`;
    if (filter) {
      url += `&comparator=ilike&textMessage=%25${filter}%25`;
    }
    return this.http.get(url)
      .map((response: Response) => OnmsNotification.importNotifications(response.json().notification))
      .toPromise()
  }

  acknowledgeNotification(notification: OnmsNotification) : Promise<OnmsAck> {
    return this.requestAcknodwledge(notification.id, 'ack');
  }

  unacknowledgeNotification(notification: OnmsNotification) : Promise<OnmsAck> {
    return this.requestAcknodwledge(notification.id, 'unack');
  }

  private requestAcknodwledge(notifyId: number, action: string) : Promise<OnmsAck> {
    const ackRequest = `notifId=${notifyId}&action=${action}`;
    return this.http.post('/rest/acks', 'application/x-www-form-urlencoded', ackRequest)
      .map((response: Response) => OnmsAck.importAck(response.json()))
      .toPromise()
  }

}