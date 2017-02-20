import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { GeolocationQuery, OnmsMapsService } from '../../services/onms-maps';

@Component({
  selector: 'page-regional-status',
  templateUrl: 'regional-status.html'
})
export class RegionalStatusPage {

  query: GeolocationQuery = new GeolocationQuery();

  constructor(
    private alertCtrl: AlertController,
    private mapService: OnmsMapsService
  ) {}

  ionViewDidLoad() {
    this.mapService.createMap('map', this.query)
      .catch(error => this.alert('Load Map', error))
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
