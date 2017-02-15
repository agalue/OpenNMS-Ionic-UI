import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsServer } from '../models/onms-server';
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
    return new Promise((resolve, reject) =>
      this.http.get(url)
        .timeout(3000, new Error('Timeout exceeded'))
        .map((response: Response) => OnmsEvent.importEvents(response.json().event))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

  getEvent(eventId: number = 0) : Promise<OnmsEvent> {
    let url = `/rest/events/${eventId}`;
    return new Promise<OnmsEvent>((resolve, reject) =>
      this.http.get(url)
        .map((response: Response) => OnmsEvent.importEvent(response.json()))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

}