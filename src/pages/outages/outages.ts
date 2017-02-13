import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-outages',
  templateUrl: 'outages.html'
})
export class OutagesPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad OutagesPage');
  }

  onRefresh() {

  }

}
