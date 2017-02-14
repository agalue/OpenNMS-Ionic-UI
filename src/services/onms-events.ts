import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsServer } from '../models/onms-server';
import { OnmsEvent } from '../models/onms-event';
import { HttpUtilsService } from './http-utils';

import 'rxjs/Rx';

@Injectable()
export class OnmsEventsService {

  eventsPerPage: number = 10;

  constructor(private httpUtils: HttpUtilsService) {}

  getEvents(server: OnmsServer, start: number = 0, filter: string = null) : Promise<OnmsEvent[]> {
    let url = `/rest/events?order=desc&orderBy=eventTime&offset=${start}&limit=${this.eventsPerPage}`;
    if (filter) {
      url += `&comparator=ilike&eventDescr=${filter}`;
    }
    return this.httpUtils.get(server, url)
      .map((response: Response) =>  OnmsEvent.importEvents(response.json().event))
      .toPromise();
  }

}