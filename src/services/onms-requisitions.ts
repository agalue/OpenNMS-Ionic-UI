import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsRequisition } from '../models/onms-requisition';
import { OnmsRequisitionStats } from '../models/onms-requisition-stats';
import { OnmsRequisitionNode } from '../models/onms-requisition-node';
import { OnmsRequisitionsCache } from '../models/onms-requisitions-cache';
import { OnmsForeignSource } from '../models/onms-foreign-source';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsRequisitionsService {

  private cache = new OnmsRequisitionsCache();

  constructor(private http: HttpService) {}
  
  private updateDeployedStats(requisitions: OnmsRequisition[]) : Promise<any> {
    return new Promise((resolve, reject) => {
      console.debug('getting deployed stats');
      this.getRequisitionStats()
        .then((requisitionsStats: OnmsRequisitionStats[]) => {
          console.debug('updating requisitions with deployed stats');
          requisitionsStats.forEach(requisitionStats => {
            const req = requisitions.find(r => r.foreignSource == requisitionStats.foreignSource);
            if (req) {
              req.update(requisitionStats);
            }
          });
          resolve();
        })
        .catch(error => reject(error))
    });
  }

  private updateDeployedStatsForRequisition(requisition: OnmsRequisition) : Promise<any> {
    return this.getRequisitionStatsForRequisition(requisition.foreignSource)
      .then((requisitionStats: OnmsRequisitionStats) => requisition.update(requisitionStats));
  }

  importRequisition(foreignSource: string, rescanExisting: string = 'true') : Promise<any> {
    return this.http.put(`/rest/requisitions/${foreignSource}?importRescanExisting=${rescanExisting}`, null, null)
      .toPromise();
  }

  getRequisitions() : Promise<OnmsRequisition[]> {
    return new Promise((resolve, reject) => {
      let requisitions = this.cache.getCachedRequisitions();
      if (requisitions) {
        resolve(requisitions);
        return;
      }
      console.debug('loading requisitions');
      this.http.get('/rest/requisitions')
        .map((response: Response) => OnmsRequisition.importRequisitions(response.json()['model-import']))
        .toPromise()
        .then(requisitions => {
          console.debug('requisitions loaded');
          this.updateDeployedStats(requisitions)
            .then(() => {
              console.debug('requisitions updated');
              this.cache.setCachedRequisitions(requisitions);
              resolve(requisitions);
            })
            .catch(error => reject(error))
        })
        .catch(error => reject(error))
     });
  }

  getRequisitionNames() : Promise<string[]> {
    return this.http.get('/rest/requisitionNames')
      .map((response: Response) => response.json()['foreign-source'])
      .toPromise();
  }

  getRequisitionStats() : Promise<OnmsRequisitionStats[]> {
    return this.http.get('/rest/requisitions/deployed/stats')
      .map((response: Response) => OnmsRequisitionStats.imporStats(response.json()['foreign-source']))
      .toPromise();
  }

  getRequisitionStatsForRequisition(foreignSource: string) : Promise<OnmsRequisitionStats> {
    return this.http.get(`/rest/requisitions/deployed/stats/${foreignSource}`)
      .map((response: Response) => OnmsRequisitionStats.importSingleStats(response.json()))
      .toPromise();
  }

  getRequisition(foreignSource: string) : Promise<OnmsRequisition> {
      let requisition = this.cache.getCachedRequisition(foreignSource);
      if (requisition) {
        return Promise.resolve(requisition);
      }
      return this.http.get(`/rest/requisitions/${foreignSource}`)
        .map((response: Response) => {
          const requisition = OnmsRequisition.importRequisition(response.json());
          this.cache.setCachedRequisition(requisition);
          return requisition;
        })
        .toPromise();
  }

  saveRequisition(requisition: OnmsRequisition) : Promise<any> {
    const rawRequisition = requisition.generateModel();
    return this.http.post('/rest/requisitions', 'application/json', rawRequisition)
      .toPromise();
  }

  removeRequisition(requisition: OnmsRequisition) : Promise<any> {
    return Promise.reject('Not implemented yet, sorry!');
  }

  getNode(foreignSource: string, foreignId: string) : Promise<OnmsRequisitionNode> {
    let node = this.cache.getCachedNode(foreignSource, foreignId);
    if (node) {
      return Promise.resolve(node);
    }
    return this.http.get(`/rest/requisitions/${foreignSource}/nodes/${foreignId}`)
      .map((response: Response) => {
        const node = OnmsRequisitionNode.importNode(response.json());
        this.cache.getCachedRequisition(foreignSource).updateNode(node);
        return node;
      })
      .toPromise();
  }

  saveNode(foreignSource: string, node: OnmsRequisitionNode) : Promise<any> {
    const rawNode = node.generateModel();
    return this.http.post(`/rest/requisitions/${foreignSource}/nodes`, 'application/json', rawNode)
      .toPromise();
  }

  getForeignSourceDefinition(foreignSource: string) : Promise<OnmsForeignSource> {
    return this.http.get(`/rest/foreignSources/${foreignSource}`)
      .map((response: Response) => OnmsForeignSource.importForeignSource(response.json()))
      .toPromise();
  }

  saveForeignSourceDefinition(foreignSource: OnmsForeignSource) : Promise<any> {
    const rawForeignSource = foreignSource.generateModel();
    return this.http.post('/rest/foreignSources', 'application/json', rawForeignSource)
      .toPromise();
  }

  getAvailableAssets() : Promise<string[]> {
    return this.http.get('/rest/foreignSourcesConfig/assets')
      .map((response: Response) => response.json().element)
      .toPromise();
  }

  getAvailableCategories() : Promise<string[]> {
    return this.http.get('/rest/foreignSourcesConfig/categories')
      .map((response: Response) => response.json().element)
      .toPromise();
  }

  getAvailableServices(foreignSource: string) : Promise<string[]> {
    return this.http.get(`/rest/foreignSourcesConfig/services/${foreignSource}`)
      .map((response: Response) => response.json().element)
      .toPromise();
  }

}