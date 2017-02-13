import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';

import { ServerPage } from '../../pages/server/server';
import { HomePage } from '../../pages/home/home';

@Component({
  selector: 'page-setup',
  templateUrl: 'setup.html'
})
export class SetupPage {

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}

  onAddServer() {
    const modal = this.modalCtrl.create(ServerPage, { forceDefault: true });
    modal.present();
    modal.onDidDismiss(updated => { if (updated) this.navCtrl.setRoot(HomePage) });
  }

}
