import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, PopoverController } from 'ionic-angular';

import { NotificationPage } from '../notification/notification';
import { AlarmsOptionsPage } from '../alarms-options/alarms-options';
import { OnmsAck } from '../../models/onms-ack';
import { OnmsNotification } from '../../models/onms-notification';
import { OnmsApiFilter, AlarmOptions } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsNotificationsService } from '../../services/onms-notifications';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {

  noNotifications = false;
  notifications: OnmsNotification[] = [];
  notificationFilter: string;
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
    private notifyService: OnmsNotificationsService
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
        content: 'Loading notifications, please wait...'
      });
      loading.present();
    }
    this.notifications = [];
    this.start = 0;
    return this.loadNotifications()
      .then(() => {
        if (showLoading) loading.dismiss();
        this.noNotifications = this.notifications.length == 0
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

  onShowNotification(notification: OnmsNotification) {
    this.navCtrl.push(NotificationPage, {notification: notification});
  }

  onSearchNotifications(event: any) {
    this.notificationFilter = event.target.value;
    this.onUpdate();
  }

  onCancelSearch(event: any) {
    if (this.notificationFilter) {
      this.notificationFilter = null;
      this.onUpdate();
    }
  }

  onAckNotification(notification: OnmsNotification) {
    this.notifyService.acknowledgeNotification(notification)
      .then((ack: OnmsAck) => {
        notification.update(ack);
        this.toast('Notification acknowledged!');
      })
      .catch(error => this.alert('Ack Error', error));
  }

  onUnackNotification(notification: OnmsNotification) {
    this.notifyService.unacknowledgeNotification(notification)
      .then((ack: OnmsAck) => {
        notification.update(ack);
        this.toast('Notification unacknowledged!');
      })
      .catch(error => this.alert('Unack Error', error));
  }

  onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    this.loadNotifications()
      .then((canScroll: boolean) => {
        infiniteScroll.complete();
        infiniteScroll.enable(canScroll);
      })
      .catch(error => this.alert('Load Error', error));
  }

  formatUei(uei: string) {
    return this.uiService.getFormattedUei(uei);
  }

  getIconColor(notification: OnmsNotification) {
    return this.uiService.getNotificationIconColor(notification);
  }

  getIcon(notification: OnmsNotification) {
    return this.uiService.getNotificationIcon(notification);
  }

  private loadNotifications() : Promise<boolean> {
    return new Promise((resolve, reject) => {
      const filter = new OnmsApiFilter('textMessage', this.notificationFilter);
      this.notifyService.getNotifications(this.start, this.options, [filter])
        .then((notifications: OnmsNotification[]) => {
          notifications.forEach(n => this.notifications.push(n));
          resolve(notifications.length > 0);
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
