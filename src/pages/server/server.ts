import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavParams, ViewController, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { OnmsServer } from '../../models/onms-server';
import { OnmsServersService } from '../../services/onms-servers';

@Component({
  selector: 'page-server',
  templateUrl: 'server.html'
})
export class ServerPage extends AbstractPage {

  mode: string;
  server: OnmsServer;
  serverIndex: number;
  serverForm: FormGroup;

  private isDefault: boolean;
  private forceDefault: boolean;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private serversService: OnmsServersService    
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.server = this.navParams.get('server');
    this.serverIndex = this.navParams.get('serverIndex');
    this.forceDefault = this.navParams.get('forceDefault') || false;
    this.mode = this.server ? 'Edit' : 'Add';
    this.isDefault = this.server ? this.server.isDefault : this.forceDefault;
    this.initForm();
  }

  async onSave() {
    const v = this.serverForm.value;
    const server = new OnmsServer(v.name, v.url, v.username, v.password, this.isDefault);
    let promise: Promise<any>;
    const loading = this.loading(this.server ? 'Updating Server ...' : 'Adding Server ...');
    if (this.server) {
      promise = this.serversService.saveServer(server, this.serverIndex);
    } else {
      promise = this.serversService.saveServer(server);
    }
    try {
      await promise;
      this.viewCtrl.dismiss(true);
    } catch (error) {
      this.alert('Save Server', error);
    } finally {
      loading.dismiss();
    }
  }

  onDelete() {
    const alert = this.alertCtrl.create({
      title: 'Delete Server',
      message: `Are you sure you want to delete the ${this.server.name} server?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => { this.deleteHandler() }
        }
      ]
    });
    alert.present();
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  private async deleteHandler() {
    const loading = this.loading('Deleting ...');
    try {
      await this.serversService.removeServer(this.serverIndex);
      this.viewCtrl.dismiss(true);
    } catch (error) {
      this.alert('Delete Server', error);
    } finally {
      loading.dismiss();
    }
  }

  private initForm() {
    this.serverForm = new FormGroup({
      'name'     : new FormControl(this.server ? this.server.name     : null, Validators.required),
      'url'      : new FormControl(this.server ? this.server.url      : null, Validators.required),
      'username' : new FormControl(this.server ? this.server.username : null, Validators.required),
      'password' : new FormControl(this.server ? this.server.password : null, Validators.required)
    });
  }

}
