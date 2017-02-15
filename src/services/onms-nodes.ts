import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsNode } from '../models/onms-node';
import { OnmsIpInterface } from '../models/onms-ip-interface';
import { OnmsSnmpInterface } from '../models/onms-snmp-interface';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsNodesService {

  nodesPerPage: number = 20;

  constructor(private http: HttpService) {}

  getNodes(start: number = 0, filter: string = null) : Promise<OnmsNode[]> {
    let url = `/rest/nodes?offset=${start}&limit=${this.nodesPerPage}`;
    if (filter) {
      url += `&comparator=ilike&label=%25${filter}%25`;
    }
    return new Promise<OnmsNode[]>((resolve, reject) =>
      this.http.get(url)
        .map((response: Response) => OnmsNode.importNodes(response.json().node))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

  getNode(nodeId: number) : Promise<OnmsNode> {
    let url = `/rest/nodes/${nodeId}`;
    return new Promise<OnmsNode>((resolve, reject) =>
      this.http.get(url)
        .map((response: Response) => response.json() as OnmsNode)
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

  getIpInterfaces(nodeId: number) : Promise<OnmsIpInterface[]> {
    let url = `/rest/nodes/${nodeId}/ipinterfaces?limit=0`;
    return new Promise<OnmsIpInterface[]>((resolve, reject) =>
      this.http.get(url)
        .map((response: Response) => OnmsIpInterface.importInterfaces(response.json().ipInterface))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

  getSnmpInterfaces(nodeId: number) : Promise<OnmsSnmpInterface[]> {
    let url = `/rest/nodes/${nodeId}/snmpinterfaces?limit=0`;
    return new Promise<OnmsSnmpInterface[]>((resolve, reject) =>
      this.http.get(url)
        .map((response: Response) => OnmsSnmpInterface.importInterfaces(response.json().snmpInterface))
        .toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error))
    );
  }

}