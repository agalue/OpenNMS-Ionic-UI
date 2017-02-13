import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-requisition-asset',
  templateUrl: 'requisition-asset.html'
})
export class RequisitionAssetPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequisitionAssetPage');
  }

}
