import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { SocialSharing } from 'ionic-native';

import { OnmsAlarm } from '../../models/onms-alarm';
import { OnmsAck } from '../../models/onms-ack';
import { EventPage } from '../event/event';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsAlarmsService } from '../../services/onms-alarms';

@Component({
  selector: 'page-alarm',
  templateUrl: 'alarm.html'
})
export class AlarmPage {

  alarm: OnmsAlarm;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private uiService: OnmsUIService,
    private alarmsService: OnmsAlarmsService
  ) {
    this.alarm = navParams.get('alarm');
  }

  onShowEvent() {
    this.navCtrl.push(EventPage, { event: this.alarm.lastEvent });
  }

  onAckAlarm(acknowledge: boolean) {
    let promise = acknowledge ? this.alarmsService.acknowledgeAlarm(this.alarm) : this.alarmsService.unacknowledgeAlarm(this.alarm);
    let title = `${acknowledge ? 'Ack' : 'Unack'}nowledged!`;
    promise.then((ack: OnmsAck) => {
        this.alarm.update(ack);
        this.toast(`Alarm ${title}!`);
      })
      .catch(error => this.alert(`${title} Error`, error));
  }

  onClearAlarm() {
    this.alarmsService.clearAlarm(this.alarm)
      .then((ack: OnmsAck) => {
        this.alarm.update(ack);
        this.toast('Alarm cleared!');
      })
      .catch(error => this.alert('Clear Error', error));
  }

  onEscalateAlarm() {
    this.alarmsService.escalateAlarm(this.alarm)
      .then((ack: OnmsAck) => {
        this.alarm.update(ack);
        this.toast('Alarm escalated!');
      })
      .catch(error => this.alert('Escalate Error', error));
  }

  onShareAlarm() {
    SocialSharing.canShareViaEmail().then(() => {
      let alert = this.alertCtrl.create({
        title: 'Email Recipient',
        inputs: [
          {
            name: 'recipient',
            placeholder: 'Email Address',
            type: 'email'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Send',
            handler: data => this.shareAlarm(data.recipient)
          }
        ]
      });
      alert.present();
    }).catch(() => {
      this.alert('Cannot Share', 'Sorry, it is not possible to share via email.');
    });
  }

  private shareAlarm(recipient: string) {
    let subject = `OpenNMS Alarm ${this.alarm.id}: ${this.uiService.getFormattedUei(this.alarm.uei)}`;
    let body = `
      <b>${this.alarm.uei}</b>
      <p>${this.alarm.nodeLabel} ${this.alarm.ipAddress} ${this.alarm.serviceName}</p>
      <br><b>Log Message</b>
      <p>${this.alarm.logMessage}</p>
      <br><b>Description</b><br>
      ${this.alarm.description}
    `;
    SocialSharing.shareViaEmail(body, subject, [recipient]).then(() => {
      this.toast(`Alarm sent to ${recipient}`);
    }).catch(error => {
      this.alert('Cannt send Email', error);
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
