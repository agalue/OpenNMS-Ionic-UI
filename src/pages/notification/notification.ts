import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { OnmsServer } from '../../models/onms-server';
import { OnmsEvent } from '../../models/onms-event';
import { OnmsNotification } from '../../models/onms-notification';
import { OnmsAck } from '../../models/onms-ack';
import { EventPage } from '../event/event';
import { OnmsEventsService } from '../../services/onms-events';
import { OnmsNotificationsService } from '../../services/onms-notifications';

@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html'
})
export class NotificationPage {

  onmsServer: OnmsServer;
  notification: OnmsNotification;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private eventsService: OnmsEventsService,
    private notifyService: OnmsNotificationsService
  ) {
    this.notification = navParams.get('notification');
    this.onmsServer = navParams.get('server');
  }

  onShowEvent() {
    this.eventsService.getEvent(this.onmsServer, this.notification.eventId)
      .then((event: OnmsEvent) => {
        this.navCtrl.push(EventPage, { event: event });
      })
      .catch(error => this.alert('Event Error', error.message));
  }

  onAckNotification() {
    this.notifyService.acknowledgeNotification(this.onmsServer, this.notification)
      .then((ack: OnmsAck) => {
        this.notification.update(ack);
        this.toast('Notification acknowledged!');
      })
      .catch(error => this.alert('Ack Error', error.message));
  }

  onUnackNotification(a) {
    this.notifyService.unacknowledgeNotification(this.onmsServer, this.notification)
      .then((ack: OnmsAck) => {
        this.notification.update(ack);
        this.toast('Notification unacknowledged!');
      })
      .catch(error => this.alert('Unack Error', error.message));
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
