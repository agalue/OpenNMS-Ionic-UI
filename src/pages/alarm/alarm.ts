import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { OnmsAlarm } from '../../models/onms-alarm';
import { EventPage } from '../event/event';

@Component({
  selector: 'page-alarm',
  templateUrl: 'alarm.html'
})
export class AlarmPage {

  alarm: OnmsAlarm;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.alarm = navParams.get('alarm');
  }

  onShowEvent() {
    this.navCtrl.push(EventPage, { event: this.alarm.lastEvent });
  }

}
