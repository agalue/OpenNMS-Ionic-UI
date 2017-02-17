import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsEvent } from '../models/onms-event';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsEventsService {

  eventsPerPage: number = 20;

  constructor(private http: HttpService) {}

  getEvents(start: number = 0, filter: string = null) : Promise<OnmsEvent[]> {
    let url = `/rest/events?order=desc&orderBy=eventTime&offset=${start}&limit=${this.eventsPerPage}`;
    if (filter) {
      url += `&comparator=ilike&eventDescr=%25${filter}%25`;
    }
    return this.http.get(url)
      .timeout(3000, new Error('Timeout exceeded'))
      .map((response: Response) => OnmsEvent.importEvents(response.json().event))
      .toPromise()
  }

  getEvent(eventId: number = 0) : Promise<OnmsEvent> {
    const url = `/rest/events/${eventId}`;
    return this.http.get(url)
      .map((response: Response) => OnmsEvent.importEvent(response.json()))
      .toPromise()
  }

  sendEvent(event: OnmsEvent) : Promise<any> {
    const url = `/rest/events`;
    return this.http.post(url, 'application/json', event)
      .toPromise()
  }

}