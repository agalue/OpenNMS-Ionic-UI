import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsSnmpConfig } from '../models/onms-snmp-config';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsSnmpConfigService {

  constructor(private http: HttpService) {}

  getSnmpConfig(ipAdress: string) : Promise<OnmsSnmpConfig> {
    let url = `/rest/snmpConfig/${ipAdress}`;
    return new Promise<OnmsSnmpConfig>((resolve,reject) =>
      this.http.get(url)
        .map((response: Response) => OnmsSnmpConfig.importConfig(response.json()))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

  setSnmpConfig(ipAddress: string, config: OnmsSnmpConfig) : Promise<any> {
    let url = `/rest/snmpConfig/${ipAddress}`;
    return new Promise<any>((resolve,reject) =>
      this.http.put(url, 'application/json', config)
        .toPromise()
        .then(() => resolve())
        .catch(error => reject(error))
    );
  }

}