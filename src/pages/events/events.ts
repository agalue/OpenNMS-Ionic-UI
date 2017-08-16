import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { EventPage } from '../event/event';
import { OnmsEvent } from '../../models/onms-event';
import { OnmsApiFilter } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsEventsService } from '../../services/onms-events';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage extends AbstractPage {

  noEvents = false;
  events: OnmsEvent[] = [];
  eventFilter: string;

  private start: number = 0;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private uiService: OnmsUIService,
    private eventsService: OnmsEventsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.onRefresh();
  }

  async onRefresh() {
    const loading = this.loading('Loading events, please wait...');
    this.events = [];
    this.start = 0;
    try {
      await this.loadEvents();
      this.noEvents = this.events.length == 0
    } catch (error) {
      this.alert('Load Error', error);
    } finally {
      loading.dismiss();
    }
  }

  onShowEvent(event: OnmsEvent) {
    this.navCtrl.push(EventPage, {event: event});
  }

  onSearchEvents(event: any) {
    this.eventFilter = event.target.value;
    this.onRefresh();
  }

  onClearSearch(event: any) {
    if (this.eventFilter) {
      this.eventFilter = null;
      this.onRefresh();
    }
  }

  async onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    try {
      let canScroll = await this.loadEvents();
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    } catch (error) {
      this.alert('Load Error', error);
    }
  }

  formatUei(uei: string) {
    return this.uiService.getFormattedUei(uei);
  }

  getIcon(event: OnmsEvent) {
    return this.uiService.getEventIcon(event);
  }

  getIconColor(event: OnmsEvent) {
    return this.uiService.getEventIconColor(event);
  }

  private async loadEvents() : Promise<boolean> {
    const filter = new OnmsApiFilter('eventDescr', this.eventFilter);
    let events = await this.eventsService.getEvents(this.start, [filter]);
    this.events.push(...events);
    return events.length > 0;
  }

}
