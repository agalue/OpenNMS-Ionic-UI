import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsServer } from '../models/onms-server';
import { OnmsSlmSection } from '../models/onms-slm-section';
import { HttpUtilsService } from './http-utils';

import 'rxjs/Rx';

@Injectable()
export class OnmsAvailabilityService {

  constructor(private httpUtils: HttpUtilsService) {}

  getAvailability(server: OnmsServer) : Promise<OnmsSlmSection[]> {
    return this.httpUtils.get(server, '/rest/availability')
      .map((response: Response) =>  OnmsSlmSection.import(response.json().section))
      .toPromise();
  }

}