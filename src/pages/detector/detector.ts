import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { OnmsRequisitionDetector } from '../../models/onms-requisition-detector';

@Component({
  selector: 'page-detector',
  templateUrl: 'detector.html'
})
export class DetectorPage {

  detector: OnmsRequisitionDetector;

  constructor(private navParams: NavParams, private viewCtrl : ViewController) {
    this.detector = navParams.get('detector');
  }

  onSave() {
    this.viewCtrl.dismiss(this.detector);
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

}
