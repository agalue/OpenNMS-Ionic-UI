import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, PopoverController } from 'ionic-angular';

import { AlarmPage } from '../alarm/alarm';
import { AlarmsOptionsPage } from '../alarms-options/alarms-options';
import { OnmsAck } from '../../models/onms-ack';
import { OnmsAlarm } from '../../models/onms-alarm';
import { OnmsApiFilter, AlarmOptions } from '../../models/onms-api-filter';
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
  options: AlarmOptions = {
    limit: 20,
    newestFirst: false,
    showAcknowledged: false
  };

  private start: number = 0;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
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
      .catch(error => {
        if (showLoading) loading.dismiss();
        this.alert('Load Error', error);
      });
  }

  onShowOptions(event: any) {
    let popover = this.popoverCtrl.create(AlarmsOptionsPage, {
      options: this.options,
      onChange: (options:AlarmOptions) => {
        this.options = options;
        this.onUpdate();
      }
    });
    popover.present({ ev: event });
  }

  onShowAlarm(alarm: OnmsAlarm) {
    this.navCtrl.push(AlarmPage, {alarm: alarm});
  }

  onSearchAlarms(event: any) {
    this.alarmFilter = event.target.value;
    this.onUpdate();
  }

  onClearSearch(event: any) {
    if (this.alarmFilter) {
      this.alarmFilter = null;
      this.onUpdate();
    }
  }

  onAckAlarm(alarm: OnmsAlarm) {
    const acknowledge = ! alarm.isAcknowledged();
    let promise = acknowledge ? this.alarmsService.acknowledgeAlarm(alarm) : this.alarmsService.unacknowledgeAlarm(alarm);
    let title = `${acknowledge ? 'Ack' : 'Unack'}nowledged!`;
    promise.then((ack: OnmsAck) => {
        alarm.update(ack);
        this.toast(`Alarm ${title}!`);
      })
      .catch(error => this.alert(`${title} Error`, error));
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
    this.loadAlarms()
      .then((canScroll: boolean) => {
        infiniteScroll.complete();
        infiniteScroll.enable(canScroll);
      })
      .catch(error => this.alert('Load Error', error));
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
    return new Promise((resolve, reject) => {
      const filter = new OnmsApiFilter('description', this.alarmFilter);
      this.alarmsService.getAlarms(this.start, this.options, [filter])
        .then((alarms: OnmsAlarm[]) => {
          alarms.forEach(e => this.alarms.push(e));
          resolve(alarms.length > 0);
        })
        .catch(error => reject(error))
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
