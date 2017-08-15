import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsNode } from '../models/onms-node';
import { OnmsIpInterface } from '../models/onms-ip-interface';
import { OnmsSnmpInterface } from '../models/onms-snmp-interface';
import { OnmsResource } from '../models/onms-resource';
import { OnmsQueryResponse } from '../models/onms-query-response';
import { PrefabGraph } from '../modules/ngx-backshift/models';
import { HttpService } from './http';

import 'rxjs/Rx';

declare function escape(s:string): string;

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
    return this.http.get(`/rest/nodes/${nodeId}`)
      .map((response: Response) => response.json() as OnmsNode)
      .toPromise()
  }

  getIpInterfaces(nodeId: number) : Promise<OnmsIpInterface[]> {
    return this.http.get(`/rest/nodes/${nodeId}/ipinterfaces?limit=0`)
      .map((response: Response) => OnmsIpInterface.importInterfaces(response.json().ipInterface))
      .toPromise()
  }

  getSnmpInterfaces(nodeId: number) : Promise<OnmsSnmpInterface[]> {
    return this.http.get(`/rest/nodes/${nodeId}/snmpinterfaces?limit=0`)
      .map((response: Response) => OnmsSnmpInterface.importInterfaces(response.json().snmpInterface))
      .toPromise()
  }

  getResources(nodeId: number) : Promise<OnmsResource[]> {
    return this.http.get(`/rest/resources/fornode/${nodeId}`)
      .map((response: Response) => OnmsResource.importResources(response.json().children.resource))
      .toPromise()
  }

  getAvailableGraphs(resourceId: string) : Promise<PrefabGraph[]> {
    return this.http.get(`/rest/graphs/for/${escape(resourceId)}`)
      .map((response: Response) => response.json().name as string[])
      .toPromise()
      .then((reports: string[]) => {
        let promises: Promise<PrefabGraph>[] = [];
        reports.forEach(report =>
          promises.push(this.http.get(`/rest/graphs/${report}`)
            .map((response: Response) => response.json() as PrefabGraph)
            .toPromise())
        );
        return Promise.all(promises)
      })
  }

  getMetricData(resourceId: string, metricId: string, start: number = -7200000) : Promise<OnmsQueryResponse> {
    return this.http.get(`/rest/measurements/${escape(resourceId)}/${metricId}?start=${start}`)
      .map((response: Response) => OnmsQueryResponse.import(response.json()))
      .toPromise()
  }

  isNodeAffectedByScheduledOutage(nodeId: number) : Promise<boolean> {
    return this.http.get(`/rest/sched-outages/nodeInOutage/${nodeId}`, 'text/plain')
      .map((response: Response) => response.text() == 'true')
      .toPromise()
  }

  updateAssets(nodeId: number, asset: Object) {
    const assetParams =  this.http.encodeParams(asset);
    return this.http.put(`/rest/nodes/${nodeId}/assetRecord`, 'application/x-www-form-urlencoded', assetParams)
      .toPromise();
  }

}