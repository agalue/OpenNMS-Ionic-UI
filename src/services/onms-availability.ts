import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsServer } from '../models/onms-server';
import { OnmsSlmSection } from '../models/onms-slm-section';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsAvailabilityService {

  private timeout  = 3000;

  constructor(private http: HttpService) {}

  getAvailability() : Promise<OnmsSlmSection[]> {
    return new Promise<OnmsSlmSection[]>((resolve, reject) =>
      this.http.get('/rest/availability')
        .timeout(this.timeout, new Error('Timeout exceeded'))
        .map((response: Response) => OnmsSlmSection.import(response.json().section))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

}