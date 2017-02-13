import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-alarms',
  templateUrl: 'alarms.html'
})
export class AlarmsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlarmsPage');
  }

  onRefresh() {

  }

}
