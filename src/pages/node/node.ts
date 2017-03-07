import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import * as Leaflet from 'leaflet';

import { AssetsPage } from '../assets/assets';
import { EventPage } from '../event/event';
import { OutagePage } from '../outage/outage';
import { ResourcesPage } from '../resources/resources';
import { SetLocationPage } from '../set-location/set-location';
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
import { OnmsMapsService } from '../../services/onms-maps';

@Component({
  selector: 'page-node',
  templateUrl: 'node.html'
})
export class NodePage implements OnInit {

  mode: string = 'info';
  inScheduledOutage: boolean = false;
  node: OnmsNode;
  availability: OnmsNodeAvailability = OnmsNodeAvailability.create();
  events: OnmsEvent[] = [];
  outages: OnmsOutage[] = [];

  private map: Leaflet.Map;
  private mapOptions: Leaflet.MapOptions = {
    tap: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    maxZoom: 18
  };

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private uiService: OnmsUIService,
    private nodesService: OnmsNodesService,
    private eventsService: OnmsEventsService,
    private outagesService: OnmsOutagesService,
    private availabilityService: OnmsAvailabilityService,
    private mapService: OnmsMapsService
  ) {}

  ngOnInit() {
    this.node = this.navParams.get('node');
    this.updateDependencies();
  }

  ionViewDidEnter() {
    this.drawMap();
  }

  // TODO Create a dedicated angular component to show the map to avoid this issue
  onSelectInfo() {
    this.map = undefined;
    setTimeout(() => this.drawMap(), 500);
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
    this.navCtrl.push(AssetsPage, {node: this.node});
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

  onUseCurrentLocation() {
    const loading = this.loadingCtrl.create({
      content: 'Getting your location...'
    });
    loading.present();
    Geolocation.getCurrentPosition()
      .then(r => {
        loading.dismiss();
        const alert = this.alertCtrl.create({
          title: 'Set Node Location',
          subTitle: `latitude=${r.coords.latitude}, longitude=${r.coords.longitude}`,
          message: 'Are you want to override the node location? This cannot be undone.',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Save Coordinates',
              handler: () => this.saveCoordinates({ latitude: r.coords.latitude, longitude: r.coords.longitude})
            }
          ]
        });
        alert.present();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Could not get location', error.message)
      });
  }

  onSelectOnMap() {
    const modal = this.modalCtrl.create(SetLocationPage, { node: this.node });
    modal.onDidDismiss(data => {
      if (data) this.saveCoordinates(data);
    });
    modal.present();
  }

  formatUei(uei: string) : string {
    return this.uiService.getFormattedUei(uei);
  }

  getOutageColor(outage: OnmsOutage) : string {
    return this.uiService.getOutageIconColor(outage);
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
    // In scheduled outage
    this.nodesService.isNodeAffectedByScheduledOutage(this.node.id)
      .then(inScheduledOutage => this.inScheduledOutage = inScheduledOutage)
      .catch(error => console.error(`Cannot retrieve scheduled outage information: ${error}`));
  }

  private drawMap() {
    if (this.node.hasLocation()) {
      let location: [number,number] = this.node.getLocation();
      if (!this.map) {
        this.map = this.mapService.createMap('map', this.mapOptions);
      }
      this.map.setView(location, 16);
      Leaflet.marker(location).addTo(this.map);
    }
  }

  private saveCoordinates(coords: {latitude: number, longitude: number}) {
    this.node.assetRecord.latitude = coords.latitude;
    this.node.assetRecord.longitude = coords.longitude;
    const loading = this.loadingCtrl.create({ content: 'Updating node assets...' });
    loading.present();
    this.nodesService.updateAssets(this.node.id, coords)
      .then(() => {
        loading.dismiss();
        this.toast('Coordinates updated!');
        this.drawMap();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Update Assets Error', error);
      });
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
