import { Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { OnmsRequisitionPolicy } from '../../models/onms-requisition-policy';
import { OnmsRequisitionParameter } from '../../models/onms-requisition-parameter';
import { OnmsForeignSourceConfig } from '../../models/onms-foreign-source-config';
import { OnmsForeignSourceConfigParameter } from '../../models/onms-foreign-source-config-parameter';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-policy',
  templateUrl: 'policy.html'
})
export class PolicyPage implements OnInit {

  mode: string;
  policy: OnmsRequisitionPolicy;
  configs: OnmsForeignSourceConfig[] = [];
  hasAvailableParameters = true;

  constructor(
    private navParams: NavParams,
    private viewCtrl : ViewController,
    private requisitionsService: OnmsRequisitionsService
  ) {}

  ngOnInit() {
    this.policy  = this.navParams.get('policy');
    this.configs = this.navParams.get('configs');
    this.mode = this.policy ? 'Edit' : 'Add';
    if (this.mode == 'Add') {
      this.policy = OnmsRequisitionPolicy.create();
    }
    this.updateParameters();
  }

  onClassChange(className: string) {
    this.policy.parameters = [];
    this.getRequiredParameters(className).forEach(p => {
      this.policy.parameters.push(OnmsRequisitionParameter.create(p));
    });
  }

  onAddParameter() {
    this.policy.parameters.push(new OnmsRequisitionParameter());
  }

  onRemoveParameter(index: number) {
    this.policy.parameters.splice(index, 1);
    this.hasAvailableParameters = true;
  }

  onSave() {
    this.viewCtrl.dismiss(this.policy);
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  getAvailableParameters() : string[] {
    let available: string[] = [];
    const className = this.policy.className;
    this.configs.find(c => c.className == className)
      .parameters.filter(p => !p.required)
      .forEach(p => {
        const exist = this.policy.parameters.find(param => param.key == p.key);
        if (!exist) available.push(p.key);
      });
    this.hasAvailableParameters = available.length > 1;
    return available;
  }

  private updateParameters() {
    this.policy.parameters.forEach(param => {
      const p = this.configs.find(c => c.className == this.policy.className)
        .parameters.find(cp => cp.key == param.key);
      param.update(p);
    });
  }

  private getRequiredParameters(className: string) : OnmsForeignSourceConfigParameter[] {
    return this.configs.find(c => c.className == className)
      .parameters.filter(p => p.required)
  }

}
