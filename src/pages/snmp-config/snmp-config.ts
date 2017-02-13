import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-snmp-config',
  templateUrl: 'snmp-config.html'
})
export class SnmpConfigPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad SnmpConfigPage');
  }

}
