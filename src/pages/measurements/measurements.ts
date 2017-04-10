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
  query: OnmsQueryResponse;

  metrics: string[] = [];
  metricSelected: string;

  timeRanges: {range: number, title: string}[] = [
    { range: 3600000,    title: '1 Hour'   },
    { range: 7600000,    title: '2 Hours'  },
    { range: 21600000,   title: '6 Hours'  },
    { range: 86400000,   title: '24 Hours' },
    { range: 172800000,  title: '48 Hours' },
    { range: 604800000,  title: '1 Week'   },
    { range: 2592000000, title: '1 Month'  }
  ];
  timeRangeSelected = this.timeRanges[3].range; // 24 Hours (default)

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private nodesService: OnmsNodesService
  ) {}

  ionViewDidLoad() {
    this.resource = this.navParams.get('resource');
    this.metrics = this.navParams.get('metrics');
  }

  onSourceChange() {
    const loading = this.loadingCtrl.create({ content: 'Loading measurements data ...' });
    loading.present();
    this.nodesService.getMetricData(this.resource.id, this.metricSelected, -this.timeRangeSelected)
      .then(query => {
        loading.dismiss();
        this.query = query;
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
