import { Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { OnmsRequisitionDetector } from '../../models/onms-requisition-detector';
import { OnmsRequisitionParameter } from '../../models/onms-requisition-parameter';
import { OnmsForeignSourceConfig } from '../../models/onms-foreign-source-config';
import { OnmsForeignSourceConfigParameter } from '../../models/onms-foreign-source-config-parameter';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-detector',
  templateUrl: 'detector.html'
})
export class DetectorPage implements OnInit {

  mode: string;
  detector: OnmsRequisitionDetector;
  configs: OnmsForeignSourceConfig[] = [];
  hasAvailableParameters = true;

  constructor(
    private navParams: NavParams,
    private viewCtrl : ViewController,
    private requisitionsService: OnmsRequisitionsService
  ) {}

  ngOnInit() {
    this.detector  = this.navParams.get('detector');
    this.configs = this.navParams.get('configs');
    this.mode = this.detector ? 'Edit' : 'Add';
    if (this.mode == 'Add') {
      this.detector = OnmsRequisitionDetector.create();
    }
    this.updateParameters();
  }

  onClassChange(className: string) {
    this.detector.parameters = [];
    this.getRequiredParameters(className).forEach(p => {
      this.detector.parameters.push(OnmsRequisitionParameter.create(p));
    });
  }

  onAddParameter() {
    this.detector.parameters.push(new OnmsRequisitionParameter());
  }

  onRemoveParameter(index: number) {
    this.detector.parameters.splice(index, 1);
    this.hasAvailableParameters = true;
  }

  onSave() {
    this.viewCtrl.dismiss(this.detector);
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  getAvailableParameters() : string[] {
    let available: string[] = [];
    const className = this.detector.className;
    this.configs.find(c => c.className == className)
      .parameters.filter(p => !p.required)
      .forEach(p => {
        const exist = this.detector.parameters.find(param => param.key == p.key);
        if (!exist) available.push(p.key);
      });
    this.hasAvailableParameters = available.length > 1;
    return available;
  }

  private updateParameters() {
    this.detector.parameters.forEach(param => {
      const p = this.configs.find(c => c.className == this.detector.className)
        .parameters.find(cp => cp.key == param.key);
      param.update(p);
    });
  }

  private getRequiredParameters(className: string) : OnmsForeignSourceConfigParameter[] {
    return this.configs.find(c => c.className == className)
      .parameters.filter(p => p.required)
  }

}
