import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsServer } from '../models/onms-server';
import { OnmsOutage } from '../models/onms-outage';
import { OnmsOutageSummary } from '../models/onms-outage-summary';
import { HttpUtilsService } from './http-utils';

import 'rxjs/Rx';

@Injectable()
export class OnmsOutagesService {

  outagesPerPage: number = 10;

  constructor(private httpUtils: HttpUtilsService) {}

  getOutages(server: OnmsServer, start: number = 0, filter: string = null) : Promise<OnmsOutage[]> {
    let url = `/rest/outages?order=desc&orderBy=ifLostService&offset=${start}&limit=${this.outagesPerPage}`;
    if (filter) {
      url += `&comparator=ilike&serviceLostEvent.eventDescr=${filter}`;
    }
    return this.httpUtils.get(server, url)
      .map((response: Response) =>  OnmsOutage.importOutages(response.json().outage))
      .toPromise();
  }

  getSumaries(server: OnmsServer, start: number = 0) : Promise<OnmsOutageSummary[]> {
    let url = `/rest/outages/summaries?offset=${start}&limit=${this.outagesPerPage}`;
    return this.httpUtils.get(server, url)
      .map((response: Response) =>  OnmsOutageSummary.importSumaries(response.json()['outage-summary']))
      .toPromise();
  }

}