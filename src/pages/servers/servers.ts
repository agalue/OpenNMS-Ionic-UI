import { Component } from '@angular/core';
import { ModalController, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { ServerPage } from '../server/server';
import { OnmsServer } from '../../models/onms-server';
import { OnmsServersService } from '../../services/onms-servers';

@Component({
  selector: 'page-servers',
  templateUrl: 'servers.html'
})
export class ServersPage extends AbstractPage {

  servers: OnmsServer[] = [];

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private serversService: OnmsServersService    
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.loadServers();
  }

  onAddServer() {
    const modal = this.modalCtrl.create(ServerPage, { forceDefault: this.servers.length == 0 });
    modal.present();
    modal.onDidDismiss((reload) => { if (reload) this.loadServers() });
  }

  onEditServer(serverIndex: number) {
    const modal = this.modalCtrl.create(ServerPage, { server: this.servers[serverIndex], serverIndex: serverIndex });
    modal.present();
    modal.onDidDismiss((reload) => { if (reload) this.loadServers() });
  }

  onRemoveServer(serverIndex: number) {
    const server = this.servers[serverIndex];
    const alert = this.alertCtrl.create({
      title: 'Delete Server',
      message: `Are you sure you want to delete the ${server.name} server?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => { this.removeServer(serverIndex) }
        }
      ]
    });
    alert.present();
  }

  async onSetDefault(serverIndex: number) {
    try {
      await this.serversService.setDefault(serverIndex)
      await this.loadServers();
      this.toast('Default server was changed');
    } catch (error) {
      this.alert('Error setting default', error);
    }
  }

  private async loadServers() {
    try {
      this.servers = await this.serversService.getServers();
    } catch (error) {
      this.alert('Error loading servers', error);
    }
  }

  private async removeServer(serverIndex: number) {
    const server = this.servers[serverIndex];
    try {
      await this.serversService.removeServer(serverIndex)
      await this.loadServers();
      this.toast(`Server ${server.name} has been removed.`);
    } catch (error) {
      error => this.alert('Error deleting server', error);
    }
  }

}
