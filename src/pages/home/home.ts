import { Component } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';

import { OnmsAlarmStats } from '../../models/onms-alarm-stats';
import { OnmsOutageSummary } from '../../models/onms-outage-summary';
import { OnmsSlmSection } from '../../models/onms-slm-section';
import { OnmsAlarmsService } from '../../services/onms-alarms';
import { OnmsOutagesService } from '../../services/onms-outages';
import { OnmsAvailabilityService } from '../../services/onms-availability';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  mode = 'Availability';
  sections: OnmsSlmSection[] = [];
  alarms: OnmsAlarmStats[] = [];
  outages: OnmsOutageSummary[] = [];
  outagesPerService: { [service: string ] : number };

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private alarmsService: OnmsAlarmsService,
    private outagesService: OnmsOutagesService,
    private availService: OnmsAvailabilityService
  ) {}

  ionViewWillLoad() {
    this.onRefresh();
  }

  onRefresh() {
    const loading = this.loadingCtrl.create({
      content: 'Loading statistics, please wait...'
    });
    loading.present();

    let availStats = this.availService.getAvailability();
    let alarmStats = this.alarmsService.getStatistics();
    let outageSummary = this.outagesService.getSumaries();
    let outagesPerService = this.outagesService.getCurrentOutagesPerService();
    Promise.all([availStats, alarmStats, outageSummary, outagesPerService])
      .then((results: any[]) => {
        this.sections = results[0];
        this.alarms = results[1];
        this.outages = results[2];
        this.outagesPerService = results[3];
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
