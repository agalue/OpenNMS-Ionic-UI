import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { OnmsEvent } from '../../models/onms-event';

@Component({
  selector: 'page-event',
  templateUrl: 'event.html'
})
export class EventPage {

  event: OnmsEvent;

  constructor(private navParams: NavParams) {}

  ionViewWillLoad() {
    this.event = this.navParams.get('event');
  }

}
