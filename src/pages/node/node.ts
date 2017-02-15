import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { OnmsNode } from '../../models/onms-node';
import { OnmsNodesService } from '../../services/onms-nodes';

@Component({
  selector: 'page-node',
  templateUrl: 'node.html'
})
export class NodePage {

  mode = 'info';
  node: OnmsNode;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private nodesService: OnmsNodesService
  ) {
    this.node = navParams.get('node');
    if (this.node.ipInterfaces.length == 0) {
      this.nodesService.getIpInterfaces(this.node.id)
        .then(interfaces => this.node.ipInterfaces = interfaces)
        .catch(() => console.log('Cannot retrieve IP interfaces'));
    }
    if (this.node.snmpInterfaces.length == 0) {
      this.nodesService.getSnmpInterfaces(this.node.id)
        .then(interfaces => this.node.snmpInterfaces = interfaces)
        .catch(() => console.log('Cannot retrieve SNMP interfaces'));
    }
  }

}
