import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { OnmsEvent } from '../../models/onms-event';

@Component({
  selector: 'page-event',
  templateUrl: 'event.html'
})
export class EventPage {

  event: OnmsEvent;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.event = navParams.get('event');
  }

}
