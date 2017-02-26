import { Component } from '@angular/core';
import { NavParams, AlertController } from 'ionic-angular';

import { OnmsResource } from '../../models/onms-resource';

import { OnmsNodesService } from '../../services/onms-nodes';

@Component({
  selector: 'page-resource-graphs',
  templateUrl: 'resource-graphs.html'
})
export class ResourceGraphsPage {

  resource: OnmsResource;
  reports: string[] = [];
  width: 300;
  height: 500;
  end: number;
  start: number;

  constructor(
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private nodesService: OnmsNodesService
  ) {}

  ionViewWillLoad() {
    this.resource = this.navParams.get('resource');
    this.end = Date.now();
    this.start = this.end - (12*60*60*1000); // (30*24*60*60*1000); // 30 days ago
    this.nodesService.getAvailableGraphs(this.resource.id)
      .then((reports: string[]) => {
        this.reports = reports;
      })
      .catch(error => {
        this.alert('Load Error', error)
      });
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
