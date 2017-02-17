import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsSlmSection } from '../models/onms-slm-section';
import { OnmsNodeAvailability } from '../models/onms-node-availability';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsAvailabilityService {

  private timeout  = 3000;

  constructor(private http: HttpService) {}

  getAvailability() : Promise<OnmsSlmSection[]> {
    return this.http.get('/rest/availability')
      .timeout(this.timeout, new Error('Timeout exceeded'))
      .map((response: Response) => OnmsSlmSection.import(response.json().section))
      .toPromise()
  }

  getAvailabilityForNode(nodeId: number) : Promise<OnmsNodeAvailability> {
    return this.http.get(`/rest/availability/nodes/${nodeId}`)
      .map((response: Response) => OnmsNodeAvailability.import(response.json()))
      .toPromise()
  }

}