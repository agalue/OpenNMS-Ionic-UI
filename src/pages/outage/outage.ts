import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { OnmsOutage } from '../../models/onms-outage';
import { EventPage } from '../event/event';

@Component({
  selector: 'page-outage',
  templateUrl: 'outage.html'
})
export class OutagePage {

  outage: OnmsOutage;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams
  ) {}

  ionViewWillLoad() {
    this.outage = this.navParams.get('outage');
  }

  onShowLostEvent() {
    this.navCtrl.push(EventPage, { event: this.outage.serviceLostEvent });
  }

  onShowRegainedEvent() {
    this.navCtrl.push(EventPage, { event: this.outage.serviceRegainedEvent });
  }

  getIconColor() {
    return this.outage.serviceRegainedEvent ? 'Normal' : 'Major';
  }

}
