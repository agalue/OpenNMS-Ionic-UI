import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/Rx';

import { OnmsServer, ONMS_MERIDIAN, ONMS_HORIZON } from '../models/onms-server';

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

  getDefaultServer() : Promise<OnmsServer> {
    if (this.defaultServer) {
      return Promise.resolve(this.defaultServer);
    }
    return new Promise<OnmsServer>((resolve, reject) => {
      return this.getServers()
        .then((servers: OnmsServer[]) => {
          const defaultServer = servers.find(server => server.isDefault);
          this.defaultServer = defaultServer;
          this.notify(defaultServer);
          resolve(defaultServer);
        })
        .catch(error => reject(error));
    });
  }

  getServers() : Promise<OnmsServer[]> {
    return this.storage.get(ONMS_SERVERS)
      .then((servers: OnmsServer[]) => servers ? servers.slice() : []);
  }

  saveServer(server: OnmsServer, index?: number) {
    return new Promise<OnmsServer>((resolve, reject) => {
      this.updateVersion(server)
        .then((updatedServer: OnmsServer) => {
          console.debug(`saving server ${updatedServer.name} with version ${updatedServer.version}`);
          this.getServers()
            .then(servers => {
              if (index && index > -1) {
                servers[index] = updatedServer;
              } else {
                servers.push(updatedServer);
              }
              if (updatedServer.isDefault) {
                this.defaultServer = updatedServer;
                this.notify(updatedServer);
              }
              this.storage.set(ONMS_SERVERS, servers)
                .then(() => resolve(updatedServer))
                .catch(error => reject(error));
            })
            .catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
  }

  setDefault(index: number) : Promise<OnmsServer> {
    return new Promise<OnmsServer>((resolve, reject) => {
      this.getServers()
        .then(servers => {
          const currentDefault: number = servers.findIndex(s => s.isDefault);
          servers[currentDefault].isDefault = false;
          servers[index].isDefault = true;
          this.defaultServer = servers[index];
          this.notify(this.defaultServer);
          this.storage.set(ONMS_SERVERS, servers)
            .then(() => resolve(this.defaultServer))
            .catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
  }

  removeServer(index: number) : Promise<any> {
    return new Promise<OnmsServer>((resolve, reject) => {
      this.getServers()
        .then(servers => {
          if (servers.length == 1) {
            reject('The list of servers cannot be empty. At least one server has to exist, and at least one server has to be the default.');
            return;
          }
          if (servers[index].isDefault) {
            reject('The default server cannot be deleted.');
            return;
          }
          servers.splice(index, 1);
          this.storage.set(ONMS_SERVERS, servers)
            .then(() => resolve())
            .catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
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

  private updateVersion(server: OnmsServer) : Promise<any> {
    return new Promise((resolve, reject) => {
      let headers = new Headers();
      headers.append('Authorization', 'Basic ' + btoa(server.username + ':' + server.password));
      headers.append('Accept', 'application/json');
      this.http.get(server.url + '/rest/info', new RequestOptions({ headers: headers }))
        .timeout(this.timeout)
        .map((response: Response) => response.json())
        .toPromise()
        .then(info => {
          server.type = info.packageName == 'meridian' ? ONMS_MERIDIAN : ONMS_HORIZON;
          server.version = info.displayVersion || 'Unknown';
          if (server.isDefault) {
            this.notify(server);
          }          
          resolve(server);
        })
        .catch((error: Response|any) => {
          let errMsg = '';
          if (error instanceof Response) {
            if (error.status == 0) {
              errMsg = 'Remote Server Unreachable. Make sure the URL is correct.';
            } else {
              errMsg = `${error.status} - ${error.statusText}`;
            }
          } else {
            errMsg = 'Something wrong happened retrieving the server information from OpenNMS.'
                + ' Make sure the URL and the credentials are correct.'
                + ' Also verify that CORS is enabled on the server.'
          }
          reject(errMsg);
        })
    });
  }

  private notify(server: OnmsServer) {
    this.defaultUpdated.emit(server);
  }

}