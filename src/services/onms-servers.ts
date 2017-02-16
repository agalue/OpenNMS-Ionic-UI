import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/Rx';

import { OnmsServer } from '../models/onms-server';

@Injectable()
export class OnmsServersService {

  defaultUpdated = new EventEmitter<OnmsServer>();

  private servers: OnmsServer[];
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
          this.notify();
          resolve(defaultServer);
        })
        .catch(error => reject(error));
    });
  }

  getServers() : Promise<OnmsServer[]> {
    if (this.servers) {
      return Promise.resolve(this.servers.slice());
    }
    return this.storage.get('onms-servers')
      .then((servers: OnmsServer[]) => {
        this.servers = servers == null ? [] : servers;
        return this.servers;
      });
  }

  addServer(server: OnmsServer) : Promise<any> {
    console.debug(`saving server ${server.name}`);
    return new Promise<OnmsServer>((resolve, reject) => {
      this.updateVersion(server)
        .then((updatedServer: OnmsServer) => {
          console.debug(`updatting server ${updatedServer.name} with version ${updatedServer.version}`);
          this.servers.push(updatedServer);
          this.storage.set('onms-servers', this.servers)
            .then(() => resolve(updatedServer))
            .catch(error => {
              this.servers.pop();
              reject(error);
            });
        })
        .catch(error => reject(error));
    });
  }

  updateServer(server: OnmsServer, index: number) : Promise<any> {
    return new Promise<OnmsServer>((resolve, reject) => {
      this.updateVersion(server)
        .then((updatedServer: OnmsServer) => {
          const backup = this.servers.slice();
          this.servers[index] = updatedServer;
          this.storage.set('onms-servers', this.servers)
            .then(() => {
              if (updatedServer.isDefault) {
                this.notify();
              }
              resolve(server)
            })
            .catch(error => {
              this.servers = backup;
              reject(error);
            });
        })
        .catch(error => reject(error));
    });
  }

  setDefault(index: number) : Promise<any> {
    return new Promise<OnmsServer>((resolve, reject) => {
      const currentDefault: number = this.servers.findIndex(s => s.isDefault);
      this.servers[currentDefault].isDefault = false;
      this.servers[index].isDefault = true;
      this.defaultServer = this.servers[index];
      this.notify();
      this.storage.set('onms-servers', this.servers)
        .then(() => resolve())
        .catch(error => {
          this.servers[currentDefault].isDefault = true;
          this.servers[index].isDefault = false;
          this.defaultServer = this.servers[currentDefault];
          this.notify();
          reject(error);
        });      
    });
  }

  removeServer(index: number) : Promise<any> {
    if (this.servers.length == 1) {
      return Promise.reject('The list of servers cannot be empty. At least one server has to exist, and at least one server has to be the default.');
    }
    if (this.servers[index].isDefault) {
      return Promise.reject('The default server cannot be deleted.');
    }
    return new Promise<OnmsServer>((resolve, reject) => {
      const backup = this.servers.slice();
      this.servers.splice(index, 1);
      this.storage.set('onms-servers', this.servers)
        .then(() => resolve())
        .catch(error => {
          this.servers = backup;
          reject(error);
        });
    });
  }

  private updateVersion(server: OnmsServer) : Promise<any> {
    return new Promise((resolve, reject) => {
      let headers = new Headers();
      headers.append('Authorization', 'Basic ' + btoa(server.username + ':' + server.password));
      headers.append('Accept', 'application/json');
      this.http.get(server.url + '/rest/info', new RequestOptions({ headers: headers }))
        .timeout(this.timeout, new Error('Timeout exceeded'))
        .map((response: Response) => response.json())
        .toPromise()
        .then(info => {
          console.log(info);
          server.type = info.packageDescription;
          server.version = info.displayVersion || 'Unknown';
          resolve(server);
        })
        .catch(() => reject('Something wrong happened retrieving the server information from OpenNMS'))
    });
  }

  private notify() {
      this.defaultUpdated.emit(this.defaultServer);
  }

}