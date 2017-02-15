import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { NodePage } from '../node/node';
import { OnmsNode } from '../../models/onms-node';
import { OnmsNodesService } from '../../services/onms-nodes';

@Component({
  selector: 'page-nodes',
  templateUrl: 'nodes.html'
})
export class NodesPage {

  noNodes = false;
  nodes: OnmsNode[] = [];
  nodeFilter: string;

  private start: number = 0;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private nodesService: OnmsNodesService
  ) {}

  onRefresh() {
    const loading = this.loadingCtrl.create({
      content: 'Loading nodes, please wait...'
    });
    loading.present();
    this.nodes = [];
    this.start = 0;
    this.loadNodes()
      .then(() => {
        loading.dismiss();
        this.noNodes = this.nodes.length == 0
      })
      .catch(() => loading.dismiss());
  }

  onShowNode(node: OnmsNode) {
    this.navCtrl.push(NodePage, {node: node});
  }

  onSearchNodes(event: any) {
    this.nodeFilter = event.target.value;
    this.onRefresh();
  }

  onCancelSearch(event: any) {
    if (this.nodeFilter) {
      this.nodeFilter = null;
      this.onRefresh();
    }
  }

  onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    this.loadNodes().then((canScroll: boolean) => {
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    });
  }

  private loadNodes() : Promise<boolean> {
    return new Promise(resolve => {
      this.nodesService.getNodes(this.start, this.nodeFilter)
        .then((nodes: OnmsNode[]) => {
          nodes.forEach(n => this.nodes.push(n));
          resolve(nodes.length > 0);
        })
        .catch(error => this.alert('Load Error', error))
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
