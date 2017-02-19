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
    Promise.all([availStats, alarmStats, outageSummary])
      .then((results: any[]) => {
        this.sections = <OnmsSlmSection[]>results[0];
        this.alarms = <OnmsAlarmStats[]>results[1];
        this.outages = <OnmsOutageSummary[]>results[2];
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
