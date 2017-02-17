import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsSnmpConfig } from '../models/onms-snmp-config';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsSnmpConfigService {

  constructor(private http: HttpService) {}

  getSnmpConfig(ipAdress: string) : Promise<OnmsSnmpConfig> {
    const url = `/rest/snmpConfig/${ipAdress}`;
    return this.http.get(url)
      .map((response: Response) => OnmsSnmpConfig.importConfig(response.json()))
      .toPromise()
  }

  setSnmpConfig(ipAddress: string, config: OnmsSnmpConfig) : Promise<any> {
    const url = `/rest/snmpConfig/${ipAddress}`;
    return this.http.put(url, 'application/json', config)
      .toPromise()
  }

}