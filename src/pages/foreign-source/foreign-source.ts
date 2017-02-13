import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-foreign-source',
  templateUrl: 'foreign-source.html'
})
export class ForeignSourcePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForeignSourcePage');
  }

}
