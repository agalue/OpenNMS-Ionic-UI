import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, AlertController, ToastController } from 'ionic-angular';

import { ServerPage } from '../server/server';
import { OnmsServer } from '../../models/onms-server';
import { OnmsServersService } from '../../services/onms-servers';

@Component({
  selector: 'page-servers',
  templateUrl: 'servers.html'
})
export class ServersPage implements OnInit {

  servers: OnmsServer[] = [];

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
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
          handler: () => this.removeServer(serverIndex)
        }
      ]
    });
    alert.present();
  }

  onSetDefault(serverIndex: number) {
    this.serversService.setDefault(serverIndex)
      .then(() => {
        this.loadServers();
        this.toast('Default server was changed');
      })
      .catch(error => console.log(error));
  }

  private loadServers() {
    this.serversService.getServers()
      .then((servers:OnmsServer[]) => this.servers = servers)
      .catch(error => console.log(error));
  }

  private removeServer(serverIndex: number) {
    const server = this.servers[serverIndex];
    this.serversService.removeServer(serverIndex)
      .then(() => {
        this.loadServers();
        this.toast(`Server ${server.name} has been removed.`)
      })
      .catch(error => this.alert('Delete Server', error));
  }

  private alert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: title,
      message: message,
      buttons: ['Ok']
    });
    alert.present();
  }

  private toast(message: string) {
    const alert = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    alert.present();
  }

}
