import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController } from 'ionic-angular';

import { AlarmPage } from '../alarm/alarm';
import { OnmsAck } from '../../models/onms-ack';
import { OnmsAlarm } from '../../models/onms-alarm';
import { OnmsApiFilter } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsAlarmsService } from '../../services/onms-alarms';

@Component({
  selector: 'page-alarms',
  templateUrl: 'alarms.html'
})
export class AlarmsPage {

  noAlarms = false;
  alarms: OnmsAlarm[] = [];
  alarmFilter: string;

  private start: number = 0;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private uiService: OnmsUIService,
    private alarmsService: OnmsAlarmsService
  ) {}

  ionViewWillLoad() {
    this.onUpdate();
  }

  onRefresh(refresher: any) {
    this.onUpdate(false).then(() => refresher.complete());
  }

  onUpdate(showLoading: boolean = true) : Promise<any> {
    let loading = null;
    if (showLoading) {
      loading = this.loadingCtrl.create({
        content: 'Loading alarms, please wait...'
      });
      loading.present();
    }
    this.alarms = [];
    this.start = 0;
    return this.loadAlarms()
      .then(() => {
        if (showLoading) loading.dismiss();
        this.noAlarms = this.alarms.length == 0
      })
      .catch(() => loading.dismiss());
  }

  onShowAlarm(alarm: OnmsAlarm) {
    this.navCtrl.push(AlarmPage, {alarm: alarm});
  }

  onSearchAlarms(event: any) {
    this.alarmFilter = event.target.value;
    this.onUpdate();
  }

  onCancelSearch(event: any) {
    if (this.alarmFilter) {
      this.alarmFilter = null;
      this.onUpdate();
    }
  }

  onAckAlarm(alarm: OnmsAlarm) {
    this.alarmsService.acknowledgeAlarm(alarm)
      .then((ack: OnmsAck) => {
        alarm.update(ack);
        this.toast('Alarm acknowledged!');
      })
      .catch(error => this.alert('Ack Error', error));
  }

  onUnackAlarm(alarm: OnmsAlarm) {
    this.alarmsService.unacknowledgeAlarm(alarm)
      .then((ack: OnmsAck) => {
        alarm.update(ack);
        this.toast('Alarm unacknowledged!');
      })
      .catch(error => this.alert('Unack Error', error));
  }

  onClearAlarm(alarm: OnmsAlarm) {
    this.alarmsService.clearAlarm(alarm)
      .then((ack: OnmsAck) => {
        alarm.update(ack);
        this.toast('Alarm cleared!');
      })
      .catch(error => this.alert('Clear Error', error));
  }

  onEscalateAlarm(alarm: OnmsAlarm) {
    this.alarmsService.escalateAlarm(alarm)
      .then((ack: OnmsAck) => {
        alarm.update(ack);
        this.toast('Alarm escalated!');
      })
      .catch(error => this.alert('Escalate Error', error));
  }

  onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    this.loadAlarms().then((canScroll: boolean) => {
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    });
  }

  formatUei(uei: string) {
    return this.uiService.getFormattedUei(uei);
  }

  getIconColor(alarm: OnmsAlarm) {
    return this.uiService.getAlarmIconColor(alarm);
  }

  getIcon(alarm: OnmsAlarm) {
    return this.uiService.getAlarmIcon(alarm);
  }

  private loadAlarms() : Promise<boolean> {
    return new Promise(resolve => {
      const filter = new OnmsApiFilter('description', this.alarmFilter);
      this.alarmsService.getAlarms(this.start, [filter])
        .then((alarms: OnmsAlarm[]) => {
          alarms.forEach(e => this.alarms.push(e));
          resolve(alarms.length > 0);
        })
        .catch(error => this.alert('Load Error', error))
    });
  }

  private toast(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  private alert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Ok']
    });
    alert.present();
  }

}
