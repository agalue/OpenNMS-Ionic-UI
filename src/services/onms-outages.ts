import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsOutage } from '../models/onms-outage';
import { OnmsOutageSummary } from '../models/onms-outage-summary';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsOutagesService {

  outagesPerPage: number = 20;

  constructor(private http: HttpService) {}

  getOutages(start: number = 0, filter: string = null) : Promise<OnmsOutage[]> {
    let url = `/rest/outages?order=desc&orderBy=ifLostService&offset=${start}&limit=${this.outagesPerPage}`;
    if (filter) {
      url += `&comparator=ilike&serviceLostEvent.eventDescr=%25${filter}%25`;
    }
    return this.http.get(url)
      .map((response: Response) => OnmsOutage.importOutages(response.json().outage))
      .toPromise()
  }

  getSumaries(start: number = 0) : Promise<OnmsOutageSummary[]> {
    const url = `/rest/outages/summaries?offset=${start}&limit=${this.outagesPerPage}`;
    return this.http.get(url)
      .map((response: Response) => OnmsOutageSummary.importSumaries(response.json()['outage-summary']))
      .toPromise()
  }

}