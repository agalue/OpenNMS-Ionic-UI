import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsRequisition } from '../models/onms-requisition';
import { OnmsRequisitionNode } from '../models/onms-requisition-node';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsRequisitionsService {

  useCache: boolean = true; // FIXME Use configuration
  requisitionsCache: OnmsRequisition[] = [];

  constructor(private http: HttpService) {}

  private getCachedRequisitions() : OnmsRequisition[] {
    if (this.useCache) {
      return this.requisitionsCache;
    }
    return null;
  }

  private setCachedRequisitions(requisitions: OnmsRequisition[]) {
    if (this.useCache) {
      this.requisitionsCache = requisitions;
    }
  }

  private setCachedRequisition(requisition: OnmsRequisition) {
    if (this.useCache) {
        const pos = this.requisitionsCache.findIndex(r => r.foreignSource == requisition.foreignSource);
        if (pos == -1) {
            this.requisitionsCache.push(requisition);
        } else {
            this.requisitionsCache[pos] = requisition;
        }
    }
  }

  private getCachedRequisition(foreignSource: string) : OnmsRequisition {
    if (this.useCache) {
      return this.requisitionsCache.find(r => r.foreignSource == foreignSource);
    }
    return null;
  }

  private getCachedNode(foreignSource: string, foreignId: string) : OnmsRequisitionNode {
    if (this.useCache) {
      const requisition = this.getCachedRequisition(foreignSource);
      if (requisition) {
        return requisition.getNode(foreignId);
      }
    }
    return null;
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
      let requisitions = this.getCachedRequisitions();
      if (requisitions) {
        resolve(requisitions);
        return;
      }
      this.http.get('/rest/requisitions')
        .map((response: Response) => OnmsRequisition.importRequisitions(response.json()['model-import']))
        .toPromise()
        .then(requisitions => {
          this.setCachedRequisitions(requisitions);
          resolve(requisitions);
        })
        .catch(error => reject(error))
     });
  }

  getRequisition(foreignSource: string) : Promise<OnmsRequisition> {
    return new Promise((resolve, reject) => {
      let requisition = this.getCachedRequisition(foreignSource);
      if (requisition) {
        resolve(requisition);
        return;
      }
      this.http.get(`/rest/requisitions/${foreignSource}`)
        .map((response: Response) => OnmsRequisition.importRequisition(response.json()))
        .toPromise()
        .then(requisition => {
          this.setCachedRequisition(requisition);
          resolve(requisition);
        })
        .catch(error => reject(error))
     });
  }

  saveRequisition(requisition: OnmsRequisition) : Promise<Object> {
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

  getNode(foreignSource: string, foreignId: string) : Promise<OnmsRequisitionNode[]> {
    return new Promise((resolve, reject) => {
      let node = this.getCachedNode(foreignSource, foreignId);
      if (node) {
        resolve(node);
        return;
      }
      this.http.get(`/rest/requisitions/${foreignSource}/${foreignId}`)
        .map((response: Response) => OnmsRequisitionNode.importNode(response.json()))
        .toPromise()
        .then(node => {
          this.getCachedRequisition(foreignSource).updateNode(node);
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

}