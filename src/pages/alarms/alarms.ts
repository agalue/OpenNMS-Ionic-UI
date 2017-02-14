import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import { OnmsServer } from '../../models/onms-server';
import { OnmsAlarm } from '../../models/onms-alarm';

import { AlarmPage } from '../alarm/alarm';

import { OnmsServersService } from '../../services/onms-servers';
import { OnmsAlarmsService } from '../../services/onms-alarms';

@Component({
  selector: 'page-alarms',
  templateUrl: 'alarms.html'
})
export class AlarmsPage {

  noAlarms = false;
  alarms: OnmsAlarm[] = [];
  alarmFilter: string;
  onmsServer: OnmsServer;

  private start: number = 0;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private serversService: OnmsServersService,
    private alarmsService: OnmsAlarmsService
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
    const loading = this.loadingCtrl.create({
      content: 'Loading alarms, please wait...'
    });
    loading.present();
    this.alarms = [];
    this.start = 0;
    this.loadAlarms()
      .then(() => {
        loading.dismiss();
        this.noAlarms = this.alarms.length == 0
      })
      .catch(() => loading.dismiss());
  }

  loadAlarms() {
    return new Promise(resolve => {
      this.alarmsService.getAlarms(this.onmsServer, this.start, this.alarmFilter)
        .then(alarms => {
          alarms.forEach(e => this.alarms.push(e));
          resolve(true);
        });
    });
  }

  onShowAlarm(alarm: OnmsAlarm) {
    this.navCtrl.push(AlarmPage, {alarm: alarm});
  }

  onSearchAlarms(event: any) {
    this.alarmFilter = event.target.value;
    this.onRefresh();
  }

  onCancelSearch(event: any) {
    if (this.alarmFilter) {
      this.alarmFilter = null;
      this.onRefresh();
    }
  }

  doInfinite(infiniteScroll: any) {
    console.log('doInfinite, start is currently ' + this.start);
    this.start += 10;
    this.loadAlarms().then(() => infiniteScroll.complete());
  }

  formatUei(uei: string) {
    let ret: string = uei.replace(/^.*\//g, '');
    ret = ret.search(/_/) == -1 ? ret.replace(/([A-Z])/g, ' $1') : ret.replace('_', ' ');
    return ret.charAt(0).toUpperCase() + ret.slice(1);
  }

  getIconColor(alarm: OnmsAlarm) {
    return alarm.severity + '_';
  }

}
