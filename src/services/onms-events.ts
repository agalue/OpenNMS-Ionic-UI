import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsEvent } from '../models/onms-event';
import { OnmsApiFilter } from '../models/onms-api-filter';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsEventsService {

  eventsPerPage: number = 20;

  constructor(private http: HttpService) {}

  getEvents(start: number = 0, filters: OnmsApiFilter[] = [], limit: number = this.eventsPerPage) : Promise<OnmsEvent[]> {
    let url = `/rest/events?order=desc&orderBy=eventTime&offset=${start}&limit=${limit}`;
    if (filters.length > 0) {
      url += `&comparator=ilike&${OnmsApiFilter.encodeFilters(filters)}`;
    }
    return this.http.get(url)
      .timeout(3000, new Error('Timeout exceeded'))
      .map((response: Response) => OnmsEvent.importEvents(response.json().event))
      .toPromise()
  }

  getEvent(eventId) : Promise<OnmsEvent> {
    return this.http.get(`/rest/events/${eventId}`)
      .map((response: Response) => OnmsEvent.importEvent(response.json()))
      .toPromise()
  }

  // TODO: This expects org.opennms.netmgt.xml.event.Event
  sendEvent(event: Object) : Promise<any> {
    return this.http.post('/rest/events', 'application/json', event)
      .toPromise()
  }

}