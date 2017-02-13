import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Storage } from '@ionic/storage';

import { OnmsServer } from '../models/onms-server';
import { HttpUtilsService } from './http-utils';

import 'rxjs/Rx';

@Injectable()
export class OnmsServersService {

  private servers: OnmsServer[];
  private defaultServer: OnmsServer;

  constructor(private storage: Storage, private httpUtils: HttpUtilsService) {}

  getDefaultServer() : Promise<OnmsServer> {
    if (this.defaultServer) {
      return Promise.resolve(this.defaultServer);
    }
    return new Promise<OnmsServer>((resolve, reject) => {
      return this.getServers()
        .then((servers: OnmsServer[]) => {
          const defaultServer = servers.find(server => server.isDefault);
          this.defaultServer = defaultServer;
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
    return new Promise<OnmsServer>((resolve, reject) => {
      this.updateVersion(server)
        .then((updatedServer: OnmsServer) => {
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
            .then(() => resolve(updatedServer))
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
      this.storage.set('onms-servers', this.servers)
        .then(() => resolve())
        .catch(error => {
          this.servers[currentDefault].isDefault = true;
          this.servers[index].isDefault = false;
          reject(error);
        });      
    });
  }

  removeServer(index: number) : Promise<any> {
    if (this.servers.length == 1) {
      return Promise.reject({ message: 'The list of servers cannot be empty. At least one server has to exist, and at least one server has to be the default.' });
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
    return this.httpUtils.get(server, '/rest/info')
      .map((response: Response) => {
        const info = response.json();
        server.type = info.packageDescription;
        server.version = info.displayVersion;
        return server;        
      })
      .toPromise();
  }

}