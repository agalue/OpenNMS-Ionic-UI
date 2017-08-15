import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { NodePage } from '../node/node';
import { OnmsNode } from '../../models/onms-node';
import { OnmsNodesService } from '../../services/onms-nodes';

@Component({
  selector: 'page-nodes',
  templateUrl: 'nodes.html'
})
export class NodesPage extends AbstractPage {

  noNodes = false;
  nodes: OnmsNode[] = [];
  nodeFilter: string;

  private start: number = 0;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private nodesService: OnmsNodesService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  async onRefresh() {
    const loading = this.loading('Searching nodes, please wait...');
    this.nodes = [];
    this.start = 0;
    try {
      await this.loadNodes();
      this.noNodes = this.nodes.length == 0
    } catch (error) {
      this.alert('Load Error', error);
    } finally {
      loading.dismiss();
    }
  }

  onShowNode(node: OnmsNode) {
    this.navCtrl.push(NodePage, {node: node});
  }

  onSearchNodes(event: any) {
    this.nodeFilter = event.target.value;
    this.onRefresh();
  }

  onClearSearch(event: any) {
    if (this.nodeFilter) {
      this.nodeFilter = null;
      this.onRefresh();
    }
  }

  async onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    try {
      let canScroll = await this.loadNodes();
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    } catch (error) {
      this.alert('Load Error', error);
    }
  }

  private async loadNodes() : Promise<boolean> {
    let nodes = await this.nodesService.getNodes(this.start, this.nodeFilter);
    this.nodes.push(...nodes);
    return nodes.length > 0;
  }

}
