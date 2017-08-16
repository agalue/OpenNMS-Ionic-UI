import { Component } from '@angular/core';
import { LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
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
export class HomePage extends AbstractPage {

  mode = 'Availability';
  sections: OnmsSlmSection[] = [];
  alarms: OnmsAlarmStats[] = [];
  outages: OnmsOutageSummary[] = [];
  outagesPerService: { [service: string ] : number };

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private alarmsService: OnmsAlarmsService,
    private outagesService: OnmsOutagesService,
    private availService: OnmsAvailabilityService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.onRefresh();
  }

  async onRefresh() {
    const loading = this.loading('Loading statistics, please wait...');
    try {
      let availStats = this.availService.getAvailability();
      let alarmStats = this.alarmsService.getStatistics();
      let outageSummary = this.outagesService.getSumaries();
      let outagesPerService = this.outagesService.getCurrentOutagesPerService();
      let results = await Promise.all([availStats, alarmStats, outageSummary, outagesPerService]);
      this.sections = results[0];
      this.alarms = results[1];
      this.outages = results[2];
      this.outagesPerService = results[3];
    } catch (error) {
      this.alert('Cannot retrieve availability data.', error);
    } finally {
      loading.dismiss();
    }
  }

}
