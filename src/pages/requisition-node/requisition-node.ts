import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-requisition-node',
  templateUrl: 'requisition-node.html'
})
export class RequisitionNodePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequisitionNodePage');
  }

}
