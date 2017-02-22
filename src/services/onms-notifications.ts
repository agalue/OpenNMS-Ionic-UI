import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsNotification } from '../models/onms-notification';
import { OnmsAck } from '../models/onms-ack';
import { OnmsApiFilter, AlarmOptions } from '../models/onms-api-filter';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsNotificationsService {

  constructor(private http: HttpService) {}

  getNotifications(start: number = 0, options: AlarmOptions, filters: OnmsApiFilter[] = []) : Promise<OnmsNotification[]> {
    let order = options.newestFirst ? 'desc' : 'asc';
    let url = `/rest/notifications?order=${order}&orderBy=notifyId&offset=${start}&limit=${options.limit}`;
    filters.push(new OnmsApiFilter('answeredBy', options.showAcknowledged ? 'notnull' : 'null'));
    if (filters.length > 0) {
      url += `&comparator=ilike&${OnmsApiFilter.encodeFilters(filters)}`
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