import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from 'ionic-angular';

import { OnmsServer } from '../../models/onms-server';
import { OnmsServersService } from '../../services/onms-servers';

import { ServerPage } from '../server/server';

@Component({
  selector: 'page-servers',
  templateUrl: 'servers.html'
})
export class ServersPage implements OnInit {

  servers: OnmsServer[] = [];

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private serversService: OnmsServersService    
  ) {}

  ngOnInit() {
    this.loadServers();
  }

  onAddServer() {
    const modal = this.modalCtrl.create(ServerPage, { forceDefault: this.servers.length == 0 });
    modal.present();
    modal.onDidDismiss((reload) => { if (reload) this.loadServers() });
  }

  onEditServer(server: OnmsServer, serverIndex: number) {
    const modal = this.modalCtrl.create(ServerPage, { server: server, serverIndex: serverIndex });
    modal.present();
    modal.onDidDismiss((reload) => { if (reload) this.loadServers() });
  }

  onSetDefault(serverIndex: number) {
    this.serversService.setDefault(serverIndex)
      .then(() => this.loadServers())
      .catch(error => console.log(error));
  }

  private loadServers() {
    this.serversService.getServers()
      .then((servers:OnmsServer[]) => this.servers = servers)
      .catch(error => console.log(error));
  }

}
