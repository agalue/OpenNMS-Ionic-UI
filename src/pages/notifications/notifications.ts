import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, PopoverController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { NotificationPage } from '../notification/notification';
import { AlarmsOptionsPage } from '../alarms-options/alarms-options';
import { OnmsNotification } from '../../models/onms-notification';
import { OnmsApiFilter, AlarmOptions } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsNotificationsService } from '../../services/onms-notifications';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage extends AbstractPage {

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
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private uiService: OnmsUIService,
    private notifyService: OnmsNotificationsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.onUpdate();
  }

  async onRefresh(refresher: any) {
    await this.onUpdate(false);
    refresher.complete();
  }

  async onUpdate(showLoading: boolean = true) : Promise<any> {
    let loading = null;
    if (showLoading) {
      loading = this.loading('Loading notifications, please wait...');
    }
    this.notifications = [];
    this.start = 0;
    try {
      await this.loadNotifications();
      this.noNotifications = this.notifications.length == 0
    } catch (error) {
      this.alert('Load Error', error);
    } finally {
      if (showLoading) loading.dismiss();
    }
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

  onClearSearch(event: any) {
    if (this.notificationFilter) {
      this.notificationFilter = null;
      this.onUpdate();
    }
  }

  async onAckNotification(notification: OnmsNotification) {
    const acknowledge = ! notification.isAcknowledged();
    let promise = acknowledge ? this.notifyService.acknowledgeNotification(notification) : this.notifyService.unacknowledgeNotification(notification);
    let title = `${acknowledge ? 'Ack' : 'Unack'}nowledged!`;
    try {
      let ack = await promise;
      notification.update(ack);
      this.toast(`Notification ${title}!`);
    } catch (error) {
      this.alert(`${title} Error`, error);
    }
  }

  async onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    try {
      let canScroll = await this.loadNotifications();
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    } catch (error) {
      error => this.alert('Load Error', error);
    }
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

  private async loadNotifications() : Promise<boolean> {
    const filter = new OnmsApiFilter('textMessage', this.notificationFilter);
    let notifications = await this.notifyService.getNotifications(this.start, this.options, [filter]);
    this.notifications.push(...notifications);
    return notifications.length > 0;
  }

}
