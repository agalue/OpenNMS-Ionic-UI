import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { OnmsServer } from '../../models/onms-server';
import { OnmsAlarm } from '../../models/onms-alarm';
import { OnmsAck } from '../../models/onms-ack';
import { EventPage } from '../event/event';
import { OnmsAlarmsService } from '../../services/onms-alarms';

@Component({
  selector: 'page-alarm',
  templateUrl: 'alarm.html'
})
export class AlarmPage {

  onmsServer: OnmsServer;
  alarm: OnmsAlarm;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private alarmsService: OnmsAlarmsService
  ) {
    this.alarm = navParams.get('alarm');
    this.onmsServer = navParams.get('server');
  }

  onShowEvent() {
    this.navCtrl.push(EventPage, { event: this.alarm.lastEvent });
  }

  onAckAlarm() {
    this.alarmsService.acknowledgeAlarm(this.onmsServer, this.alarm)
      .then((ack: OnmsAck) => {
        this.alarm.update(ack);
        this.toast('Alarm acknowledged!');
      })
      .catch(error => this.alert('Ack Error', error.message));
  }

  onUnackAlarm(a) {
    this.alarmsService.unacknowledgeAlarm(this.onmsServer, this.alarm)
      .then((ack: OnmsAck) => {
        this.alarm.update(ack);
        this.toast('Alarm unacknowledged!');
      })
      .catch(error => this.alert('Unack Error', error.message));
  }

  onClearAlarm() {
    this.alarmsService.clearAlarm(this.onmsServer, this.alarm)
      .then((ack: OnmsAck) => {
        this.alarm.update(ack);
        this.toast('Alarm cleared!');
      })
      .catch(error => this.alert('Clear Error', error.message));
  }

  onEscalateAlarm() {
    this.alarmsService.escalateAlarm(this.onmsServer, this.alarm)
      .then((ack: OnmsAck) => {
        this.alarm.update(ack);
        this.toast('Alarm escalated!');
      })
      .catch(error => this.alert('Escalate Error', error.message));
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
