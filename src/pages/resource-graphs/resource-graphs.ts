import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { OnmsResource } from '../../models/onms-resource';

@Component({
  selector: 'page-resource-graphs',
  templateUrl: 'resource-graphs.html'
})
export class ResourceGraphsPage {

  resource: OnmsResource;
  reportName: string;
  width: 300;
  height: 500;
  end: number;
  start: number;

  constructor(private navParams: NavParams) {}

  ionViewWillLoad() {
    this.resource = this.navParams.get('resource');
    this.reportName = this.navParams.get('reportName');
    this.end = Date.now();
    this.start = this.end - (12*60*60*1000); // (30*24*60*60*1000); // 30 days ago
  }

}
