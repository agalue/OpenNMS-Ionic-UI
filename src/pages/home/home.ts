import { Component } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';

import { OnmsSlmSection } from '../../models/onms-slm-section';
import { OnmsAvailabilityService } from '../../services/onms-availability';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  mode = 'Availability';
  sections: OnmsSlmSection[] = [];

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private availService: OnmsAvailabilityService
  ) {}

  ionViewWillLoad() {
    this.onRefresh();
  }

  onRefresh() {
    const loading = this.loadingCtrl.create({
      content: 'Loading information, please wait...'
    });
    loading.present();
    this.availService.getAvailability()
      .then(sections => {
        this.sections = sections
        loading.dismiss();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Cannot retrieve availability data.', error)
      });
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
