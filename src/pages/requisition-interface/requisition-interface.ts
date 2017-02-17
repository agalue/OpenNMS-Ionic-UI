import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ViewController, NavParams } from 'ionic-angular';

import { OnmsRequisitionInterface } from '../../models/onms-requisition-interface';

@Component({
  selector: 'page-requisition-interface',
  templateUrl: 'requisition-interface.html'
})
export class RequisitionInterfacePage implements OnInit {

  mode: string;
  form: FormGroup;
  intf: OnmsRequisitionInterface;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams
  ) {}

  ngOnInit() {
    this.intf  = this.navParams.get('intf');
    this.mode = this.intf ? 'Edit' : 'Add';
    if (this.mode == 'Add') {
      this.intf = OnmsRequisitionInterface.create();
    }
    this.initForm();
  }

  onSave() {
    this.viewCtrl.dismiss(this.intf);
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  private initForm() {
    this.form = new FormGroup({
      'ipAddress' : new FormControl(this.intf.ipAddress, Validators.required),
      'description' : new FormControl(this.intf.description, Validators.required),
      'snmpPrimary' : new FormControl(this.intf.snmpPrimary, Validators.required)
    });
  }

}
