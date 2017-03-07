import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { EventPage } from '../event/event';
import { OnmsEvent } from '../../models/onms-event';
import { OnmsApiFilter } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsEventsService } from '../../services/onms-events';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {

  noEvents = false;
  events: OnmsEvent[] = [];
  eventFilter: string;

  private start: number = 0;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private uiService: OnmsUIService,
    private eventsService: OnmsEventsService
  ) {}

  ionViewWillLoad() {
    this.onRefresh();
  }

  onRefresh() {
    const loading = this.loadingCtrl.create({
      content: 'Loading events, please wait...'
    });
    loading.present();
    this.events = [];
    this.start = 0;
    this.loadEvents()
      .then(() => {
        loading.dismiss();
        this.noEvents = this.events.length == 0
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Load Error', error);
      });
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

  onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    this.loadEvents()
      .then((canScroll: boolean) => {
        infiniteScroll.complete();
        infiniteScroll.enable(canScroll);
      })
      .catch(error => this.alert('Load Error', error));
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

  private loadEvents() : Promise<boolean> {
    return new Promise((resolve, reject) => {
      const filter = new OnmsApiFilter('eventDescr', this.eventFilter);
      this.eventsService.getEvents(this.start, [filter])
        .then((events: OnmsEvent[]) => {
          events.forEach(e => this.events.push(e));
          resolve(events.length > 0);
        })
        .catch(error => reject(error))
    });
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
