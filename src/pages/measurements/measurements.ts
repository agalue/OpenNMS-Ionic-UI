import { Component } from '@angular/core';
import { LoadingController, AlertController, NavParams } from 'ionic-angular';

import { OnmsQueryResponse } from '../../models/onms-query-response';
import { OnmsResource } from '../../models/onms-resource';
import { OnmsNodesService } from '../../services/onms-nodes';

@Component({
  selector: 'page-measurements',
  templateUrl: 'measurements.html'
})
export class MeasurementsPage {

  resource: OnmsResource;
  metric: string;
  query: OnmsQueryResponse;

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private nodesService: OnmsNodesService
  ) {}

  ionViewDidLoad() {
    this.resource = this.navParams.get('resource');
    this.metric = this.navParams.get('metric');
    const loading = this.loadingCtrl.create({ content: 'Loading measurements data ...' });
    loading.present();
    this.nodesService.getMetricData(this.resource.id, this.metric)
      .then(query => {
        loading.dismiss();
        this.query = query;
        console.log(this.query);
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Measurements Error', error);
      })
  }

  hasData() {
    return this.query && this.query.timestamps.length > 0;
  }

  getValue(index: number) {
    return this.query.columns[0].values[index];
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
