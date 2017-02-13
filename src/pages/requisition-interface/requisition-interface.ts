import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-requisition-interface',
  templateUrl: 'requisition-interface.html'
})
export class RequisitionInterfacePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequisitionInterfacePage');
  }

}
