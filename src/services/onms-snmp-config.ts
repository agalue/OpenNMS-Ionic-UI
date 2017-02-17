import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsSnmpConfig } from '../models/onms-snmp-config';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsSnmpConfigService {

  constructor(private http: HttpService) {}

  getSnmpConfig(ipAddress: string) : Promise<OnmsSnmpConfig> {
    return this.http.get(`/rest/snmpConfig/${ipAddress}`)
      .map((response: Response) => OnmsSnmpConfig.importConfig(response.json()))
      .toPromise()
  }

  setSnmpConfig(ipAddress: string, config: OnmsSnmpConfig) : Promise<any> {
    return this.http.put(`/rest/snmpConfig/${ipAddress}`, 'application/json', config)
      .toPromise()
  }

}