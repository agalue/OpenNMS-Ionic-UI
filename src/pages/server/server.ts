import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ViewController, AlertController, NavParams } from 'ionic-angular';

import { OnmsServer } from '../../models/onms-server';
import { OnmsServersService } from '../../services/onms-servers';

@Component({
  selector: 'page-server',
  templateUrl: 'server.html'
})
export class ServerPage implements OnInit {

  mode: string;
  server: OnmsServer;
  serverIndex: number;
  serverForm: FormGroup;

  private isDefault: boolean;
  private forceDefault: boolean;

  constructor(
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private serversService: OnmsServersService    
  ) {}

  ngOnInit() {
    this.server = this.navParams.get('server');
    this.serverIndex = this.navParams.get('serverIndex');
    this.forceDefault = this.navParams.get('forceDefault') || false;
    this.mode = this.server ? 'Edit' : 'Add';
    this.isDefault = this.server ? this.server.isDefault : this.forceDefault;
    this.initForm();
  }

  onSave() {
    const v = this.serverForm.value;
    const server = new OnmsServer(v.name, v.url, v.username, v.password, this.isDefault);
    let promise: Promise<any>;
    if (this.server) {
      promise = this.serversService.updateServer(server, this.serverIndex);
    } else {
      promise = this.serversService.addServer(server);
    }
    promise
      .then(() => this.viewCtrl.dismiss(true))
      .catch(error => this.alert('Save Server', error.message));
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
          handler: () => {
            this.serversService.removeServer(this.serverIndex)
              .then(() => this.viewCtrl.dismiss(true))
              .catch(error => this.alert('Delete Server', error.message));
          }
        }
      ]
    });
    alert.present();
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  private initForm() {
    this.serverForm = new FormGroup({
      'name'     : new FormControl(this.server ? this.server.name     : null, Validators.required),
      'url'      : new FormControl(this.server ? this.server.url      : null, Validators.required),
      'username' : new FormControl(this.server ? this.server.username : null, Validators.required),
      'password' : new FormControl(this.server ? this.server.password : null, Validators.required)
    });
  }

  private alert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: title,
      message: message,
      buttons: ['Ok']
    });
    alert.present();
  }

}
