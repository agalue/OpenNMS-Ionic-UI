import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { ResourceGraphsPage } from '../resource-graphs/resource-graphs';
import { OnmsNode } from '../../models/onms-node';
import { OnmsResource, OnmsResourcesByType } from '../../models/onms-resource';
import { OnmsNodesService } from '../../services/onms-nodes';

@Component({
  selector: 'page-resources',
  templateUrl: 'resources.html'
})
export class ResourcesPage {

  node: OnmsNode;
  resourceGroups: OnmsResourcesByType[] = [];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private nodesService: OnmsNodesService
  ) {}

  ionViewWillLoad() {
    const loading = this.loadingCtrl.create({
      content: 'Loading resources...'
    })
    loading.present();
    this.node = this.navParams.get('node');
    this.nodesService.getResources(this.node.id)
      .then(resources => {
        this.resourceGroups = OnmsResource.groupByResourceType(resources);
        loading.dismiss();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Load Error', error)
      });
  }

  onShowGraphs(resource: OnmsResource) {
    this.navCtrl.push(ResourceGraphsPage, { resource: resource });
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
