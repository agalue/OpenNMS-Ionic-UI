import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { OnmsServer } from '../../models/onms-server';
import { OnmsSlmSection } from '../../models/onms-slm-section';
import { OnmsServersService } from '../../services/onms-servers';
import { OnmsAvailabilityService } from '../../services/onms-availability';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  mode = 'Availability';
  onmsServer: OnmsServer;
  sections: OnmsSlmSection[] = [];

  constructor(
    private alertCtrl: AlertController,
    private availService: OnmsAvailabilityService,
    private serversService: OnmsServersService
  ) {}

  ionViewWillLoad() {
    this.serversService.getDefaultServer()
      .then((server: OnmsServer) => {
        this.onmsServer = server;
        this.onRefresh();
      })
      .catch(error => console.log(error));
  }

  onRefresh() {
    this.availService.getAvailability(this.onmsServer)
      .then(sections => this.sections = sections)
      .catch(error => this.alert('Cannot retrieve availability data.', error.message));
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

}
