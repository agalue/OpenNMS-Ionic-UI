import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-requisitions',
  templateUrl: 'requisitions.html'
})
export class RequisitionsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequisitionsPage');
  }

  onAddRequisition() {

  }

}
