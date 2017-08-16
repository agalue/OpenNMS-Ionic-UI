import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { ResourceGraphsPage } from '../resource-graphs/resource-graphs';
import { OnmsNode } from '../../models/onms-node';
import { OnmsResource, OnmsResourcesByType } from '../../models/onms-resource';
import { OnmsNodesService } from '../../services/onms-nodes';

@Component({
  selector: 'page-resources',
  templateUrl: 'resources.html'
})
export class ResourcesPage extends AbstractPage {

  node: OnmsNode;
  resourceGroups: OnmsResourcesByType[] = [];

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private nodesService: OnmsNodesService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.node = this.navParams.get('node');
    this.initialize();
  }

  onShowGraphs(resource: OnmsResource) {
    this.navCtrl.push(ResourceGraphsPage, { resource: resource });
  }

  private async initialize() {
    const loading = this.loading('Loading resources...');
    try {
      const resources = await this.nodesService.getResources(this.node.id);
      this.resourceGroups = OnmsResource.groupByResourceType(resources);
    } catch (error) {
      this.alert('Load Error', error);
    } finally {
      loading.dismiss();
    }
  }

}
