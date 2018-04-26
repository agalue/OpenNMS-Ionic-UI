import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { OnmsSnmpConfig } from '../../models/onms-snmp-config';
import { OnmsSnmpConfigService } from '../../services/onms-snmp-config';

@Component({
  selector: 'page-snmp-config',
  templateUrl: 'snmp-config.html'
})
export class SnmpConfigPage extends AbstractPage {

  ipAddress: string;
  config: OnmsSnmpConfig = new OnmsSnmpConfig();

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private configService : OnmsSnmpConfigService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  async onLookup(form: NgForm) {
    const loading = this.loading('Looking...');
    this.ipAddress = form.value.ipAddress;
    try {
      this.config = await this.configService.getSnmpConfig(this.ipAddress);
      this.toast(`Loopup completed for ${this.ipAddress}!`);
    } catch (error) {
      this.alert('Lookup Error', error);
    } finally {
      loading.dismiss();
    }
  }

  async onSave(form: NgForm) {
    const loading = this.loading('Saving...');
    try {
      await this.configService.setSnmpConfig(this.ipAddress, this.config);
      this.toast(`The SNMP Configuration for ${this.ipAddress} was successfully updated!`);
      form.reset();
      this.ipAddress = '';
    } catch (error) {
      this.alert('Save Error', error);
    } finally {
      loading.dismiss();
    }
  }

}
