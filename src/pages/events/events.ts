import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { EventPage } from '../event/event';
import { OnmsEvent } from '../../models/onms-event';
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
      .catch(() => loading.dismiss());
  }

  onShowEvent(event: OnmsEvent) {
    this.navCtrl.push(EventPage, {event: event});
  }

  onSearchEvents(event: any) {
    this.eventFilter = event.target.value;
    this.onRefresh();
  }

  onCancelSearch(event: any) {
    if (this.eventFilter) {
      this.eventFilter = null;
      this.onRefresh();
    }
  }

  onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    this.loadEvents().then((canScroll: boolean) => {
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    });
  }

  formatUei(uei: string) {
    let ret: string = uei.replace(/^.*\//g, '');
    ret = ret.search(/_/) == -1 ? ret.replace(/([A-Z])/g, ' $1') : ret.replace('_', ' ');
    return ret.charAt(0).toUpperCase() + ret.slice(1);
  }

  getIcon(event: OnmsEvent) {
    const index = event.getSeverityIndex();
    if (index > 5)
      return 'flame';
    if (index > 3)
      return 'warning';
    return 'alert';
  }

  getIconColor(event: OnmsEvent) {
    return event.severity + '_';
  }

  private loadEvents() : Promise<boolean> {
    return new Promise(resolve => {
      this.eventsService.getEvents(this.start, this.eventFilter)
        .then((events: OnmsEvent[]) => {
          events.forEach(e => this.events.push(e));
          resolve(events.length > 0);
        })
        .catch(error => this.alert('Load Error', error))
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
