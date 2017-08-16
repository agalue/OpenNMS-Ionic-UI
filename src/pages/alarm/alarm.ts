import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';

import { AbstractPage } from '../abstract-page';
import { OnmsAlarm } from '../../models/onms-alarm';
import { EventPage } from '../event/event';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsAlarmsService } from '../../services/onms-alarms';

@Component({
  selector: 'page-alarm',
  templateUrl: 'alarm.html'
})
export class AlarmPage extends AbstractPage {

  alarm: OnmsAlarm;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private socialSharing: SocialSharing,
    private navCtrl: NavController,
    private navParams: NavParams,
    private uiService: OnmsUIService,
    private alarmsService: OnmsAlarmsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.alarm = this.navParams.get('alarm');
  }

  onShowEvent() {
    this.navCtrl.push(EventPage, { event: this.alarm.lastEvent });
  }

  async onAckAlarm(acknowledge: boolean) {
    let promise = acknowledge ? this.alarmsService.acknowledgeAlarm(this.alarm) : this.alarmsService.unacknowledgeAlarm(this.alarm);
    let title = `${acknowledge ? 'Ack' : 'Unack'}nowledged!`;
    try {
      let ack = await promise;
      this.alarm.update(ack);
      this.toast(`Alarm ${title}!`);
    } catch (error) {
      this.alert(`${title} Error`, error);
    }
  }

  async onClearAlarm() {
    try {
      let ack = await this.alarmsService.clearAlarm(this.alarm);
      this.alarm.update(ack);
      this.toast('Alarm cleared!');
    } catch (error) {
      this.alert('Clear Error', error);
    }
  }

  async onEscalateAlarm() {
    try {
      let ack = await this.alarmsService.escalateAlarm(this.alarm);
      this.alarm.update(ack);
      this.toast('Alarm escalated!');
    } catch (error) {
      this.alert('Escalate Error', error);
    }
  }

  async onShareAlarm() {
    try {
      await this.socialSharing.canShareViaEmail();
      await this.shareAlarm();
    } catch (error) {
      this.alert('Cannot Share', 'Sorry, it is not possible to share via email.');
    }
  }

  private async shareAlarm() {
    let subject = `OpenNMS Alarm ${this.alarm.id}: ${this.uiService.getFormattedUei(this.alarm.uei)}`;
    let body = `
      <b>${this.alarm.uei}</b>
      <p>${this.alarm.nodeLabel} ${this.alarm.ipAddress} ${this.alarm.serviceName}</p>
      <br><b>Log Message</b>
      <p>${this.alarm.logMessage}</p>
      <br><b>Description</b><br>
      ${this.alarm.description}
    `;
    try {
      await this.socialSharing.shareViaEmail(body, subject, null);
    } catch (error) {
      this.alert('Cannot Send Email', error);
    }
  }

}
