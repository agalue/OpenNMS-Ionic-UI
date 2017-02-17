import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { OnmsRequisitionPolicy } from '../../models/onms-requisition-policy';

@Component({
  selector: 'page-policy',
  templateUrl: 'policy.html'
})
export class PolicyPage {

  policy: OnmsRequisitionPolicy;

  constructor(private navParams: NavParams, private viewCtrl : ViewController) {
    this.policy = navParams.get('policy');
  }

  onSave() {
    this.viewCtrl.dismiss(this.policy);
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

}
