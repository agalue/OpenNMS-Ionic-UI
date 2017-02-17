import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsOutage } from '../models/onms-outage';
import { OnmsOutageSummary } from '../models/onms-outage-summary';
import { OnmsApiFilter } from '../models/onms-api-filter';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsOutagesService {

  outagesPerPage: number = 20;

  constructor(private http: HttpService) {}

  getOutages(start: number = 0, filters: OnmsApiFilter[] = [], limit: number = this.outagesPerPage) : Promise<OnmsOutage[]> {
    let url = `/rest/outages?order=desc&orderBy=ifLostService&offset=${start}&limit=${limit}`;
    if (filters.length > 0) {
      url += `&comparator=ilike&${OnmsApiFilter.encodeFilters(filters)}`;
    }
    return this.http.get(url)
      .map((response: Response) => OnmsOutage.importOutages(response.json().outage))
      .toPromise()
  }

  getSumaries(start: number = 0) : Promise<OnmsOutageSummary[]> {
    return this.http.get(`/rest/outages/summaries?offset=${start}&limit=${this.outagesPerPage}`)
      .map((response: Response) => OnmsOutageSummary.importSumaries(response.json()['outage-summary']))
      .toPromise()
  }

}