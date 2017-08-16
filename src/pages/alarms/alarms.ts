import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, PopoverController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { AlarmPage } from '../alarm/alarm';
import { AlarmsOptionsPage } from '../alarms-options/alarms-options';
import { OnmsAlarm } from '../../models/onms-alarm';
import { OnmsApiFilter, AlarmOptions } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsAlarmsService } from '../../services/onms-alarms';

@Component({
  selector: 'page-alarms',
  templateUrl: 'alarms.html'
})
export class AlarmsPage extends AbstractPage {

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
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private uiService: OnmsUIService,
    private alarmsService: OnmsAlarmsService
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
      loading = this.loading('Loading alarms, please wait...');
    }
    this.alarms = [];
    this.start = 0;
    try {
      await this.loadAlarms();
      this.noAlarms = this.alarms.length == 0
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

  async onAckAlarm(alarm: OnmsAlarm) {
    const acknowledge = ! alarm.isAcknowledged();
    let promise = acknowledge ? this.alarmsService.acknowledgeAlarm(alarm) : this.alarmsService.unacknowledgeAlarm(alarm);
    let title = `${acknowledge ? 'Ack' : 'Unack'}nowledged!`;
    try {
      let ack = await promise;
      alarm.update(ack);
      this.toast(`Alarm ${title}!`);
    } catch (error) {
      this.alert(`${title} Error`, error);
    }
  }

  async onClearAlarm(alarm: OnmsAlarm) {
    try {
      let ack = await this.alarmsService.clearAlarm(alarm)
      alarm.update(ack);
      this.toast('Alarm cleared!');
    } catch (error) {
      this.alert('Clear Error', error);
    }
  }

  async onEscalateAlarm(alarm: OnmsAlarm) {
    try {
      let ack = await this.alarmsService.escalateAlarm(alarm);
      alarm.update(ack);
      this.toast('Alarm escalated!');
    } catch (error) {
      this.alert('Escalate Error', error);
    }
  }

  async onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    try {
      let canScroll = await this.loadAlarms();
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    } catch (error) {
      this.alert('Load Error', error);
    }
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

  private async loadAlarms() : Promise<boolean> {
    const filter = new OnmsApiFilter('description', this.alarmFilter);
    let alarms = await this.alarmsService.getAlarms(this.start, this.options, [filter]);
    this.alarms.push(...alarms);
    return alarms.length > 0;
  }

}
