import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { OnmsNode } from '../../models/onms-node';
import { OnmsEvent } from '../../models/onms-event';
import { OnmsOutage } from '../../models/onms-outage';
import { OnmsNodeAvailability } from '../../models/onms-node-availability';
import { OnmsApiFilter } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsNodesService } from '../../services/onms-nodes';
import { OnmsEventsService } from '../../services/onms-events';
import { OnmsOutagesService } from '../../services/onms-outages';
import { OnmsAvailabilityService } from '../../services/onms-availability';

@Component({
  selector: 'page-node',
  templateUrl: 'node.html'
})
export class NodePage implements OnInit {

  mode = 'info';
  node: OnmsNode;
  availability: OnmsNodeAvailability;
  events: OnmsEvent[] = [];
  outages: OnmsOutage[] = [];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private uiService: OnmsUIService,
    private nodesService: OnmsNodesService,
    private eventsService: OnmsEventsService,
    private outagesService: OnmsOutagesService,
    private availabilityService: OnmsAvailabilityService
  ) {}

  ngOnInit() {
    this.node = this.navParams.get('node');
    // Load IP Interfaces
    if (this.node.ipInterfaces.length == 0) {
      this.nodesService.getIpInterfaces(this.node.id)
        .then(interfaces => this.node.ipInterfaces = interfaces)
        .catch(error => console.error(`Cannot retrieve IP interfaces: ${error}`));
    }
    // Load SNMP Interfaces
    if (this.node.snmpInterfaces.length == 0) {
      this.nodesService.getSnmpInterfaces(this.node.id)
        .then(interfaces => this.node.snmpInterfaces = interfaces)
        .catch(error => console.error(`Cannot retrieve SNMP interfaces: ${error}`));
    }
    // Load Availability Information
    this.availabilityService.getAvailabilityForNode(this.node.id)
      .then(availability => this.availability = availability)
      .catch(error => console.error(`Cannot retrieve availability information: ${error}`));
    // Load Recent Events
    const labelFilter = new OnmsApiFilter('node.label', this.node.label);
    this.eventsService.getEvents(0, [labelFilter], 5)
      .then(events => this.events = events)
      .catch(error => console.error(`Cannot retrieve events: ${error}`));
    // Load Recent Outages
    const outstanding = new OnmsApiFilter('ifRegainedService', 'null');
    this.outagesService.getOutages(0, [labelFilter, outstanding], 5)
      .then(outages => this.outages = outages)
      .catch(error => console.error(`Cannot retrieve outages: ${error}`));
  }

  onShowOptions() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Node Commands',
      buttons: [
        {
          text: 'Show Assets',
          handler: () => this.onShowAssets()
        },
        {
          text: 'Show Graphs',
          handler: () => this.onShowGraphs()
        },
        {
          text: 'Force Rescan',
          handler: () => this.onForceRescan()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  onShowAssets() {

  }

  onShowGraphs() {

  }

  onForceRescan() {
    const loading = this.loadingCtrl.create({ content: 'Sending force rescan...'});
    loading.present();
    const event = { uei: 'uei.opennms.org/internal/capsd/forceRescan', nodeid: this.node.id };
    this.eventsService.sendEvent(event)
      .then(() => {
        loading.dismiss();
        this.toast('Force rescan event has been sent!');
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Force Rescan Error', error)
      });
  }

  formatUei(uei: string) {
    return this.uiService.getFormattedUei(uei);
  }

  getOutageColor(outage: OnmsOutage) {
    return this.uiService.getOutageIconColor(outage);
  }

  private toast(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
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
