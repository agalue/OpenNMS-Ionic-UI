import { Component } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { NavParams, ViewController, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { OnmsRequisitionInterface } from '../../models/onms-requisition-interface';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

import { AbstractPage } from '../abstract-page';
import { validateIpAddress } from '../../directives/ip-address';
import { validateUnique } from '../../directives/unique';

@Component({
  selector: 'page-requisition-interface',
  templateUrl: 'requisition-interface.html'
})
export class RequisitionInterfacePage extends AbstractPage {

  mode: string;
  form: FormGroup;
  foreignSource: string;
  intf: OnmsRequisitionInterface;
  blacklist: string[];

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private requisitionsService: OnmsRequisitionsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.foreignSource = this.navParams.get('foreignSource');
    this.intf = this.navParams.get('intf');
    this.blacklist = this.navParams.get('blacklist') || [];

    this.mode = this.intf ? 'Edit' : 'Add';
    if (this.mode == 'Add') {
      this.intf = OnmsRequisitionInterface.create();
    } else {
      const idx = this.blacklist.indexOf(this.intf.ipAddress);
      this.blacklist.splice(idx, 1);
    }

    this.initForm();
  }

  onAddService() {
    this.getServices().push(this.addService(null));
  }

  onRemoveService(index: number) {
    this.getServices().removeAt(index);
  }

  async onShowServices(index: number) {
    try {
      let services = await this.requisitionsService.getAvailableServices(this.foreignSource);
      this.chooseService(services, index);
    } catch (error) {
      this.alert('Load Services', error);
    }
  }

  onSave() {
    OnmsRequisitionInterface.assign(this.intf, this.form.value);
    this.viewCtrl.dismiss(this.intf);
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  private initForm() {
    this.form = new FormGroup({
      'ipAddress' : new FormControl(this.intf.ipAddress, [validateIpAddress, validateUnique(this.blacklist)]),
      'description' : new FormControl(this.intf.description),
      'snmpPrimary' : new FormControl(this.intf.snmpPrimary, Validators.required),
      'services' : new FormArray(this.intf.services.map(s => this.addService(s.name)))
    });
  }

  private getServices() : FormArray {
    return <FormArray>this.form.controls['services'];
  }

  private addService(value: string) : FormGroup {
    return new FormGroup({
      'name' : new FormControl(value, Validators.required),
    });
  }

  private chooseService(services: string[], index: number) {
    const options = this.alertCtrl.create({
      title: 'Choose Service',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: data => this.getServices().controls[index].get('name').setValue(data)
        }
      ]
    });
    services.forEach(service => {
      options.addInput({
        name: 'options',
        value: service,
        label: service,
        type: 'radio'
      })
    })
    options.present();
  }

}
