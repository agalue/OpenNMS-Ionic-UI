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
    return new Promise((resolve, reject) => {
      this.getRequisitionStatsForRequisition(requisition.foreignSource)
        .then((requisitionStats: OnmsRequisitionStats) => requisition.update(requisitionStats))
        .catch(error => reject(error))
    });
  }

  importRequisition(foreignSource: string, rescanExisting: string = 'true') : Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(`/rest/requisitions/${foreignSource}?importRescanExisting=${rescanExisting}`, null, null)
        .toPromise()
        .then(() => resolve())
        .catch(error => reject(error))
    });
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
    return new Promise((resolve, reject) => {
      this.http.get('/rest/requisitionNames')
        .map((response: Response) => response.json()['foreign-source'])
        .toPromise()
        .then(requisitionNames => resolve(requisitionNames))
        .catch(error => reject(error))
     });
  }

  getRequisitionStats() : Promise<OnmsRequisitionStats[]> {
    return new Promise((resolve, reject) => {
      this.http.get('/rest/requisitions/deployed/stats')
        .map((response: Response) => OnmsRequisitionStats.imporStats(response.json()['foreign-source']))
        .toPromise()
        .then(stats => resolve(stats))
        .catch(error => reject(error))
     });
  }

  getRequisitionStatsForRequisition(foreignSource: string) : Promise<OnmsRequisitionStats> {
    return new Promise((resolve, reject) => {
      this.http.get(`/rest/requisitions/deployed/stats/${foreignSource}`)
        .map((response: Response) => OnmsRequisitionStats.importSingleStats(response.json()))
        .toPromise()
        .then(stats => resolve(stats))
        .catch(error => reject(error))
     });
  }

  getRequisition(foreignSource: string) : Promise<OnmsRequisition> {
    return new Promise((resolve, reject) => {
      let requisition = this.cache.getCachedRequisition(foreignSource);
      if (requisition) {
        resolve(requisition);
        return;
      }
      this.http.get(`/rest/requisitions/${foreignSource}`)
        .map((response: Response) => OnmsRequisition.importRequisition(response.json()))
        .toPromise()
        .then(requisition => {
          this.cache.setCachedRequisition(requisition);
          resolve(requisition);
        })
        .catch(error => reject(error))
     });
  }

  saveRequisition(requisition: OnmsRequisition) : Promise<any> {
    return new Promise((resolve, reject) => {
      const rawRequisition = requisition.generateModel();
      this.http.post('/rest/requisitions', 'application/json', rawRequisition)
        .toPromise()
        .then(() => {
          resolve(rawRequisition);
        })
        .catch(error => reject(error))
    });
  }

  removeRequisition(requisition: OnmsRequisition) : Promise<any> {
    return Promise.reject('Not implemented yet, sorry!');
  }

  getNode(foreignSource: string, foreignId: string) : Promise<OnmsRequisitionNode[]> {
    return new Promise((resolve, reject) => {
      let node = this.cache.getCachedNode(foreignSource, foreignId);
      if (node) {
        resolve(node);
        return;
      }
      this.http.get(`/rest/requisitions/${foreignSource}/${foreignId}`)
        .map((response: Response) => OnmsRequisitionNode.importNode(response.json()))
        .toPromise()
        .then(node => {
          this.cache.getCachedRequisition(foreignSource).updateNode(node);
          resolve(node);
        })
        .catch(error => reject(error))
    });
  }

  saveNode(foreignSource: string, node: OnmsRequisitionNode) : Promise<Object> {
    return new Promise((resolve, reject) => {
      const rawNode = node.generateModel();
      this.http.post(`/rest/requisitions/${foreignSource}`, 'application/json', rawNode)
        .toPromise()
        .then(() => {
          resolve(rawNode);
        })
        .catch(error => reject(error))
    });
  }

  getForeignSourceDefinition(foreignSource: string) : Promise<OnmsForeignSource> {
    return new Promise((resolve, reject) => {
      this.http.get(`/rest/foreignSources/${foreignSource}`)
        .map((response: Response) => OnmsForeignSource.importForeignSource(response.json()))
        .toPromise()
        .then(foreignSource => {
          resolve(foreignSource);
        })
        .catch(error => reject(error))
     });
  }

  saveForeignSourceDefinition(foreignSource: OnmsForeignSource) : Promise<Object> {
    return new Promise((resolve, reject) => {
      const rawForeignSource = foreignSource.generateModel();
      this.http.post('/rest/foreignSources', 'application/json', rawForeignSource)
        .toPromise()
        .then(() => {
          resolve(rawForeignSource);
        })
        .catch(error => reject(error))
     });
  }

}