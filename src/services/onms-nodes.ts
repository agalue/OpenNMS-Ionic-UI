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
    return this.http.get(url)
      .map((response: Response) => OnmsNode.importNodes(response.json().node))
      .toPromise()
  }

  getNode(nodeId: number) : Promise<OnmsNode> {
    const url = `/rest/nodes/${nodeId}`;
    return this.http.get(url)
      .map((response: Response) => response.json() as OnmsNode)
      .toPromise()
  }

  getIpInterfaces(nodeId: number) : Promise<OnmsIpInterface[]> {
    const url = `/rest/nodes/${nodeId}/ipinterfaces?limit=0`;
    return this.http.get(url)
      .map((response: Response) => OnmsIpInterface.importInterfaces(response.json().ipInterface))
      .toPromise()
  }

  getSnmpInterfaces(nodeId: number) : Promise<OnmsSnmpInterface[]> {
    const url = `/rest/nodes/${nodeId}/snmpinterfaces?limit=0`;
    return this.http.get(url)
      .map((response: Response) => OnmsSnmpInterface.importInterfaces(response.json().snmpInterface))
      .toPromise()
  }

}