import { Component, OnInit } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Badge } from '@ionic-native/badge';

import { NavController, ModalController } from 'ionic-angular';

import { ServerPage } from '../../pages/server/server';
import { HomePage } from '../../pages/home/home';

@Component({
  selector: 'page-setup',
  templateUrl: 'setup.html'
})
export class SetupPage implements OnInit {

  constructor(
    private platform: Platform,
    private badge: Badge,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    if (!this.platform.is('cordova')) return;
    this.badge.registerPermission()
      .then(() => this.badge.clear())
      .catch(error => console.error(error));
  }

  onAddServer() {
    const modal = this.modalCtrl.create(ServerPage, { forceDefault: true });
    modal.present();
    modal.onDidDismiss(updated => { if (updated) this.navCtrl.setRoot(HomePage) });
  }

}
