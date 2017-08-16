import { Component } from '@angular/core';
import { NavParams, AlertController } from 'ionic-angular';

import { PrefabGraph } from '../../modules/ngx-backshift/models';
import { OnmsResource } from '../../models/onms-resource';
import { OnmsNodesService } from '../../services/onms-nodes';

/*
 * TODO: Create FavoriteGraphsService to locally store the favorite graphs.
 *       Add buttons for adding a graph to favorites or use slide options.
 */
@Component({
  selector: 'page-resource-graphs',
  templateUrl: 'resource-graphs.html'
})
export class ResourceGraphsPage {

  resource: OnmsResource;
  prefabs: PrefabGraph[] = [];
  prefabGraph: PrefabGraph;
  width: 300;  // TODO make it consistent with the current platform, for example: 0.9 * this.platform.width();
  height: 500; // TODO make it consistent with the current platform, for example: 0.5 * this.platform.height();
  end: number;
  start: number;
  timeRanges: {range: number, title: string}[] = [
    { range: 3600000,    title: '1 Hour'   },
    { range: 7600000,    title: '2 Hours'  },
    { range: 21600000,   title: '6 Hours'  },
    { range: 86400000,   title: '24 Hours' },
    { range: 172800000,  title: '48 Hours' },
    { range: 604800000,  title: '1 Week'   },
    { range: 2592000000, title: '1 Month'  }
  ];
  timeRangeSelected = this.timeRanges[2].range; // 6 Hours (default)

  constructor(
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private nodesService: OnmsNodesService
  ) {}

  ionViewWillLoad() {
    this.resource = this.navParams.get('resource');
    this.onTimeRangeChange();
    this.initialize();
  }

  onTimeRangeChange() {
    if (!this.end) this.end = Date.now();
    this.start = this.end - this.timeRangeSelected;
  }

  private async initialize() {
    try {
      this.prefabs = await this.nodesService.getAvailableGraphs(this.resource.id);
      this.prefabGraph = this.prefabs[0];
    } catch (error) {
      this.alert('Load Error', error);
    }
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
