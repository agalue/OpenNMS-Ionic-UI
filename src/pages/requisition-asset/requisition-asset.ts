import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ViewController, NavParams } from 'ionic-angular';

import { OnmsRequisitionAsset } from '../../models/onms-requisition-asset';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-requisition-asset',
  templateUrl: 'requisition-asset.html'
})
export class RequisitionAssetPage implements OnInit {

  mode: string;
  form: FormGroup;
  asset: OnmsRequisitionAsset;
  blacklist: string[];
  availableAssets: string[] = [];

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private requisitionsService: OnmsRequisitionsService
  ) {}

  ngOnInit() {
    this.asset = this.navParams.get('asset');
    this.blacklist = this.navParams.get('blacklist') || [];
    this.mode = this.asset ? 'Edit' : 'Add';

    if (this.mode == 'Add') {
      this.asset = OnmsRequisitionAsset.create();
    }
    
    this.requisitionsService.getAvailableAssets()
      .then(assets => {
        this.availableAssets = assets.filter(a => this.blacklist.indexOf(a) == -1);
        if (this.asset) this.availableAssets.push(this.asset.name);
      })
      .catch(error => console.error(error));

    this.initForm();
  }

  onSave() {
    Object.assign(this.asset, this.form.value);
    this.viewCtrl.dismiss(this.asset);
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  private initForm() {
    this.form = new FormGroup({
      'name' : new FormControl(this.asset.name, Validators.required),
      'value' : new FormControl(this.asset.value, Validators.required)
    });
  }

}
