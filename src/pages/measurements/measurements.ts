import { Component } from '@angular/core';
import { LoadingController, AlertController, ToastController, NavParams } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { OnmsQueryResponse } from '../../models/onms-query-response';
import { OnmsResource } from '../../models/onms-resource';
import { OnmsNodesService } from '../../services/onms-nodes';

@Component({
  selector: 'page-measurements',
  templateUrl: 'measurements.html'
})
export class MeasurementsPage extends AbstractPage {

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
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navParams: NavParams,
    private nodesService: OnmsNodesService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewDidLoad() {
    this.resource = this.navParams.get('resource');
    this.metrics = this.navParams.get('metrics');
  }

  async onSourceChange() {
    const loading = this.loading('Loading measurements data ...' );
    try {
      this.query = await this.nodesService.getMetricData(this.resource.id, this.metricSelected, -this.timeRangeSelected);
    } catch (error) {
      this.alert('Measurements Error', error);
    } finally {
      loading.dismiss();
    }
  }

  hasData() {
    return this.query && this.query.timestamps.length > 0;
  }

  getValue(index: number) {
    return this.query.columns[0].values[index];
  }

}
