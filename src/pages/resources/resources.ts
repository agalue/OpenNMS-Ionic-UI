import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { MeasurementsPage } from '../measurements/measurements';
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

  onShowMetrics(resource: OnmsResource) {
    const options = this.alertCtrl.create({
      title: 'Choose Metric',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: metric => this.showData(resource, metric)
        }
      ]
    });
    resource.rrdGraphAttributes.forEach(service => {
      options.addInput({
        name: 'options',
        value: service,
        label: service,
        type: 'radio'
      })
    })
    options.present();
  }

  private showData(resource: OnmsResource, metric: string) {
    this.navCtrl.push(MeasurementsPage, { resource: resource, metric: metric });
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
