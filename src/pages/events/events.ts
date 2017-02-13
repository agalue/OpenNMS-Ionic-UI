import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import { OnmsServer } from '../../models/onms-server';
import { OnmsEvent } from '../../models/onms-event';

import { EventPage } from '../event/event';

import { OnmsServersService } from '../../services/onms-servers';
import { OnmsEventsService } from '../../services/onms-events';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {

  noEvents = false;
  events: OnmsEvent[] = [];
  eventFilter: string;
  onmsServer: OnmsServer;

  private start: number = 0;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private serversService: OnmsServersService,
    private eventsService: OnmsEventsService
  ) {}

  ionViewWillLoad() {
    this.serversService.getDefaultServer()
      .then((server: OnmsServer) => {
        this.onmsServer = server;
        this.onRefresh();
      })
      .catch(error => console.log(error));
  }

  onRefresh() {
    const loading = this.loadingCtrl.create({
      content: 'Loading events, please wait...'
    });
    loading.present();
    this.events = [];
    this.loadEvents()
      .then(() => {
        loading.dismiss();
        this.noEvents = this.events.length == 0
      })
      .catch(() => loading.dismiss());
  }

  loadEvents() {
    return new Promise(resolve => {
      this.eventsService.getEvents(this.onmsServer, this.start, this.eventFilter)
        .then(events => {
          events.forEach(e => this.events.push(e));
          resolve(true);
        });
    });
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

  doInfinite(infiniteScroll: any) {
    console.log('doInfinite, start is currently ' + this.start);
    this.start += 10;
    this.loadEvents().then(() => infiniteScroll.complete());
  }

  formatUei(uei: string) {
    let ret: string = uei.replace(/^.*\//g, '');
    ret = ret.search(/_/) == -1 ? ret.replace(/([A-Z])/g, ' $1') : ret.replace('_', ' ');
    return ret.charAt(0).toUpperCase() + ret.slice(1);
  }

  getIconColor(event: OnmsEvent) {
    return event.severity + '_';
  }

}
