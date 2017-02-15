import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, ToastController } from 'ionic-angular';
import { OnmsSnmpConfig } from '../../models/onms-snmp-config';
import { OnmsSnmpConfigService } from '../../services/onms-snmp-config';

@Component({
  selector: 'page-snmp-config',
  templateUrl: 'snmp-config.html'
})
export class SnmpConfigPage {

  ipAddress: string;
  config: OnmsSnmpConfig = new OnmsSnmpConfig();

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private configService : OnmsSnmpConfigService
  ) {}

  onLookup(form: NgForm) {
    this.ipAddress = form.value.ipAddress;
    this.configService.getSnmpConfig(this.ipAddress)
      .then((config: OnmsSnmpConfig) => {
        Object.assign(this.config, config);
        this.toast(`Loopup completed for ${this.ipAddress}!`);
      })
      .catch(error => this.alert('Lookup Error', error));
  }

  onSave(form: NgForm) {
    this.configService.setSnmpConfig(this.ipAddress, this.config)
      .then(() => {
        this.toast(`The SNMP Configuration for ${this.ipAddress} was successfully updated!`);
        form.reset();
        this.ipAddress = '';
      })
      .catch(error => this.alert('Save Error', error));
  }

  private alert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Ok']
    });
    alert.present();
  }

  private toast(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

}
