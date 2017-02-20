import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import * as Leaflet from 'leaflet';

import { EventPage } from '../event/event';
import { OutagePage } from '../outage/outage';
import { ResourcesPage } from '../resources/resources';
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

  private map: Leaflet.Map;
  private tileLayer: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private mapOptions: Leaflet.MapOptions = {
    tap: true,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    maxZoom: 18,
    zoomControl: false,
    dragging: false,
    attributionControl: false
  };

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
    this.updateDependencies();
  }

  ionViewDidLoad() {
    this.drawMap();
  }

  onShowOptions() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Node Commands',
      buttons: [
        {
          text: 'Refresh Content',
          handler: () => this.onRefresh()
        },
        {
          text: 'Show Assets',
          handler: () => this.onShowAssets()
        },
        {
          text: 'Show Resources',
          handler: () => this.onShowResources()
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

  onRefresh() {
    const loading = this.loadingCtrl.create({
      content: 'Refreshing node ...'
    });
    loading.present();
    this.nodesService.getNode(this.node.id)
      .then(node => {
        Object.assign(this.node, node);
        this.updateDependencies();
        this.drawMap();
        loading.dismiss();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Refresh Node', error)
      });
  }

  onShowEvent(event: OnmsEvent) {
    this.navCtrl.push(EventPage, {event: event});
  }

  onShowOutage(outage: OnmsOutage) {
    this.navCtrl.push(OutagePage, {outage: outage});
  }

  onShowResources() {
    this.navCtrl.push(ResourcesPage, {node: this.node});
  }

  onShowAssets() {
    this.alert('Show Assets', 'Not implemented yet, sorry :(');
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

  formatUei(uei: string) : string {
    return this.uiService.getFormattedUei(uei);
  }

  getOutageColor(outage: OnmsOutage) : string {
    return this.uiService.getOutageIconColor(outage);
  }

  getAvailabilityColor(avail: number) : string {
    if (avail > 99) return 'Normal';
    if (avail > 95) return 'Warning';
    return 'Critical';
  }

  private updateDependencies() {
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

  private drawMap() {
    if (this.node.hasLocation()) {
      let location: [number,number] = this.node.getLocation();
      if (!this.map) {
        this.map = Leaflet.map('map', this.mapOptions);
        Leaflet.tileLayer(this.tileLayer).addTo(this.map);
      }
      this.map.setView(location, 16);
      Leaflet.marker(location).addTo(this.map);
    }
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
