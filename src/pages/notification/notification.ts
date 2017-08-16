import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { OnmsNotification } from '../../models/onms-notification';
import { EventPage } from '../event/event';
import { OnmsEventsService } from '../../services/onms-events';
import { OnmsNotificationsService } from '../../services/onms-notifications';

@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html'
})
export class NotificationPage extends AbstractPage {

  notification: OnmsNotification;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private eventsService: OnmsEventsService,
    private notifyService: OnmsNotificationsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.notification = this.navParams.get('notification');
  }

  async onShowEvent() {
    const loading = this.loading('Loading event...');
    try {
      let event = await this.eventsService.getEvent(this.notification.eventId);
      this.navCtrl.push(EventPage, { event: event });
    } catch (error) {
      error => this.alert('Event Error', error);
    } finally {
      loading.dismiss();
    }
  }

  async onAckNotification(acknowledge: boolean) {
    let promise = acknowledge ? this.notifyService.acknowledgeNotification(this.notification) : this.notifyService.unacknowledgeNotification(this.notification);
    let title = `${acknowledge ? 'Ack' : 'Unack'}nowledged!`;
    try {
      let ack = await promise;
      this.notification.update(ack);
      this.toast(`Notification ${title}!`);
    } catch (error) {
      this.alert(`${title} Error`, error);
    }
  }

}
