import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/Rx';

import { OnmsServer, ONMS_MERIDIAN, ONMS_HORIZON } from '../models/onms-server';
import { handleError } from './http';

export const ONMS_SERVERS = 'onms-servers';

export enum OnmsFeatures {
  Measurements,
  Minion,
  RegionalStatus
}

@Injectable()
export class OnmsServersService {

  defaultUpdated = new EventEmitter<OnmsServer>();

  private defaultServer: OnmsServer;
  private timeout  = 3000;

  constructor(private storage: Storage, private http: Http) {}

  async getDefaultServer() : Promise<OnmsServer> {
    if (this.defaultServer) return Promise.resolve(this.defaultServer);
    const servers = await this.getServers();
    const defaultServer = servers.find(server => server.isDefault);
    this.defaultServer = defaultServer;
    this.notify(defaultServer);
    return defaultServer;
  }

  async getServers() : Promise<OnmsServer[]> {
    const servers = await this.storage.get(ONMS_SERVERS);
    return servers ? servers.slice() : [];
  }

  async saveServer(server: OnmsServer, index?: number) : Promise<OnmsServer> {
    const updatedServer = await this.updateVersion(server);
    console.debug(`saving server ${updatedServer.name} with version ${updatedServer.version}`);
    return this.storeServer(updatedServer, index);      
  }

  async setDefault(index: number) : Promise<OnmsServer> {
    const servers = await this.getServers();
    const currentDefault: number = servers.findIndex(s => s.isDefault);
    servers[currentDefault].isDefault = false;
    servers[index].isDefault = true;
    this.defaultServer = servers[index];
    this.notify(this.defaultServer);
    await this.storage.set(ONMS_SERVERS, servers)
    return this.defaultServer;
  }

  async removeServer(index: number) : Promise<any> {
    const servers = await this.getServers();
    if (servers.length == 1) {
      return Promise.reject('The list of servers cannot be empty. At least one server has to exist, and at least one server has to be the default.');
    }
    if (servers[index].isDefault) {
      return Promise.reject('The default server cannot be deleted.');
    }
    servers.splice(index, 1);
    await this.storage.set(ONMS_SERVERS, servers);
  }

  supports(feature: OnmsFeatures) : boolean {
    if (!this.defaultServer) return true;
    const isMeridian = this.defaultServer.type == ONMS_MERIDIAN;
    const version: number[] = this.defaultServer.version.split(/\./).map(idx => parseInt(idx));
    switch(feature) {
      case OnmsFeatures.Measurements:
        return isMeridian ? version[0] >= 2016 : version[0] >= 17;
      case OnmsFeatures.Minion:
      case OnmsFeatures.RegionalStatus:
        return isMeridian ? version[0] >= 2017 : version[0] >= 19;
      default: return true;
    }
  }

  private async storeServer(updatedServer: OnmsServer, index: number) {
    const servers = await this.getServers();
    if (index && index > -1) {
      servers[index] = updatedServer;
    } else {
      servers.push(updatedServer);
    }
    if (updatedServer.isDefault) {
      this.defaultServer = updatedServer;
      this.notify(updatedServer);
    }
    await this.storage.set(ONMS_SERVERS, servers)
    return updatedServer;
  }

  private async updateVersion(server: OnmsServer) : Promise<any> {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(server.username + ':' + server.password));
    headers.append('Accept', 'application/json');
    const info = await this.http.get(server.url + '/rest/info', new RequestOptions({ headers: headers }))
      .timeout(this.timeout)
      .map((response: Response) => response.json())
      .catch(handleError)
      .toPromise();
    server.type = info.packageName == 'meridian' ? ONMS_MERIDIAN : ONMS_HORIZON;
    server.version = info.displayVersion || 'Unknown';
    if (server.isDefault) this.notify(server);
    return server;
  }

  private notify(server: OnmsServer) {
    this.defaultUpdated.emit(server);
  }

}