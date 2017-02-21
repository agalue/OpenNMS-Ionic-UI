import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { OnmsRequisition } from '../models/onms-requisition';
import { OnmsRequisitionStats } from '../models/onms-requisition-stats';
import { OnmsRequisitionNode } from '../models/onms-requisition-node';
import { OnmsRequisitionAsset } from '../models/onms-requisition-asset';
import { OnmsRequisitionsCache } from '../models/onms-requisitions-cache';
import { OnmsForeignSource } from '../models/onms-foreign-source';
import { OnmsForeignSourceConfig } from '../models/onms-foreign-source-config';
import { HttpService } from './http';

import 'rxjs/Rx';

@Injectable()
export class OnmsRequisitionsService {

  private cache = new OnmsRequisitionsCache();

  constructor(private http: HttpService) {}
  
  private updateDeployedStats(requisitions: OnmsRequisition[]) : Promise<any> {
    return new Promise((resolve, reject) => {
      console.debug('updateDeployedStats: getting deployed stats');
      this.getRequisitionStats()
        .then((requisitionsStats: OnmsRequisitionStats[]) => {
          console.debug('updateDeployedStats: updating requisitions with deployed stats');
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

  importRequisition(requisition: OnmsRequisition, rescanExisting: string = 'true') : Promise<any> {
    return this.http.put(`/rest/requisitions/${requisition.foreignSource}/import?importRescanExisting=${rescanExisting}`)
      .toPromise()
      .then(() => requisition.markAsDeployed())
  }

  getRequisitions() : Promise<OnmsRequisition[]> {
    return new Promise((resolve, reject) => {
      let requisitions = this.cache.getCachedRequisitions();
      if (requisitions) {
        console.debug('getRequisitions: returning requisitions from the cache');
        resolve(requisitions);
        return;
      }
      console.debug('getRequisitions: loading requisitions');
      this.http.get('/rest/requisitions')
        .map((response: Response) => OnmsRequisition.importRequisitions(response.json()['model-import']))
        .toPromise()
        .then(requisitions => {
          console.debug('getRequisitions: requisitions loaded');
          this.updateDeployedStats(requisitions)
            .then(() => {
              console.debug('getRequisitions: requisitions updated');
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
    return new Promise((resolve, reject) => {
      console.debug(`removeRequisition: removing nodes from requisition ${requisition.foreignSource}`);
      requisition.nodes = [];
      this.saveRequisition(requisition)
        .catch(error => reject(error))
        .then(() => {
          console.debug(`removeRequisition: importing requisition to remove nodes from the database`);
          this.importRequisition(requisition, 'false')
            .catch(error => reject(error))
            .then(() => {
              console.debug(`removeRequisition: deleting requisitions and foreign sources`);
              let promises: Promise<any>[] = [];
              promises.push(this.http.delete(`/rest/requisitions/${requisition.foreignSource}`).toPromise());
              promises.push(this.http.delete(`/rest/requisitions/deployed/${requisition.foreignSource}`).toPromise());
              promises.push(this.http.delete(`/rest/foreignSources/${requisition.foreignSource}`).toPromise());
              promises.push(this.http.delete(`/rest/foreignSources/deployed/${requisition.foreignSource}`).toPromise());
              Promise.all(promises)
                .catch(error => reject(error))
                .then(() => {
                  console.debug(`removeRequisition: requisition ${requisition.foreignSource} successfully removed`);
                  let requisitions = this.cache.getCachedRequisitions();
                  if (requisitions) {
                    let index = requisitions.findIndex(r => r.foreignSource == requisition.foreignSource);
                    requisitions.splice(index, 1);
                  }
                  resolve()
                });
            })
        });
    });
  }

  getNode(foreignSource: string, foreignId: string, force: boolean = false) : Promise<OnmsRequisitionNode> {
    if (!force) {
      let node = this.cache.getCachedNode(foreignSource, foreignId);
      if (node)
        return Promise.resolve(node);
    }
    return this.http.get(`/rest/requisitions/${foreignSource}/nodes/${foreignId}`)
      .map((response: Response) => {
        const node = OnmsRequisitionNode.importNode(response.json());
        if (!force) {
          this.cache.getCachedRequisition(foreignSource).updateNode(node);
        }
        return node;
      })
      .toPromise();
  }

  saveNode(foreignSource: string, node: OnmsRequisitionNode, force: boolean = false) : Promise<any> {
    const rawNode = node.generateModel();
    return this.http.post(`/rest/requisitions/${foreignSource}/nodes`, 'application/json', rawNode)
      .toPromise()
      .then(() => {
        if (!force) {
          const requisition = this.cache.getCachedRequisition(foreignSource);
          requisition.updateNode(node);
        }
      });
  }

  updateAssets(foreignSource: string, foreignId: string, assets: OnmsRequisitionAsset[]) {
    return new Promise((resolve, reject) => {
      this.getNode(foreignSource, foreignId, true)
        .then(node => {
          node.assets = assets;
          this.saveNode(foreignSource, node, true)
            .then(() => resolve())
            .catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
  }

  removeNode(foreignSource: string, node: OnmsRequisitionNode) : Promise<any> {
    return this.http.delete(`/rest/requisitions/${foreignSource}/nodes/${node.foreignId}`)
      .toPromise()
      .then(() => {
        const requisition = this.cache.getCachedRequisition(foreignSource);
        requisition.removeNode(node);
      });
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

  removeForeignSourceDefinition(foreignSource: OnmsForeignSource) : Promise<any> {
    return this.http.delete(`/rest/foreignSources/${foreignSource.name}`)
      .toPromise();
  }

  getAvailableLocations() : Promise<string[]> {
    return this.http.get('/rest/monitoringLocations')
      .map((response: Response) => {
        let locations: string[] = [];
        response.json().location.forEach(l => locations.push(l['location-name']));
        return locations;
      })
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

  getDetectorsConfig() : Promise<OnmsForeignSourceConfig[]> {
    return this.http.get('/rest/foreignSourcesConfig/detectors')
      .map((response: Response) => OnmsForeignSourceConfig.importConfigs(response.json().plugins))
      .toPromise();
  }

  getPoliciesConfig() : Promise<OnmsForeignSourceConfig[]> {
    return this.http.get('/rest/foreignSourcesConfig/policies')
      .map((response: Response) => OnmsForeignSourceConfig.importConfigs(response.json().plugins))
      .toPromise();
  }

}