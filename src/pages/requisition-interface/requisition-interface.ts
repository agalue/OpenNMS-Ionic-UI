import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ViewController, AlertController, NavParams } from 'ionic-angular';

import { OnmsRequisitionInterface } from '../../models/onms-requisition-interface';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

import { validateIpAddress } from '../../directives/ip-address';
import { validateUnique } from '../../directives/unique';

@Component({
  selector: 'page-requisition-interface',
  templateUrl: 'requisition-interface.html'
})
export class RequisitionInterfacePage implements OnInit {

  mode: string;
  form: FormGroup;
  foreignSource: string;
  intf: OnmsRequisitionInterface;
  blacklist: string[];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private requisitionsService: OnmsRequisitionsService
  ) {}

  ngOnInit() {
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

  onShowServices(index: number) {
    this.requisitionsService.getAvailableServices(this.foreignSource)
      .then((services: string[]) => this.chooseService(services, index))
      .catch(error => this.alert('Load Services', error));
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

  private alert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Ok']
    });
    alert.present();
  }

}
