import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
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
import { OnmsServersService, OnmsFeatures } from '../../services/onms-servers';

@Component({
  selector: 'page-node',
  templateUrl: 'node.html'
})
export class NodePage extends AbstractPage {

  mode: string = 'info';
  inScheduledOutage: boolean = false;
  node: OnmsNode;
  availability: OnmsNodeAvailability = OnmsNodeAvailability.create();
  events: OnmsEvent[] = [];
  outages: OnmsOutage[] = [];

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private uiService: OnmsUIService,
    private nodesService: OnmsNodesService,
    private eventsService: OnmsEventsService,
    private outagesService: OnmsOutagesService,
    private serversService: OnmsServersService,
    private availabilityService: OnmsAvailabilityService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.node = this.navParams.get('node');
  }

  ionViewDidLoad() {
    this.updateDependencies();
  }

  onShowOptions() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Node Commands',
      buttons: [
        {
          text: 'Refresh Content',
          handler: () => { this.onRefresh() }
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

  async onRefresh() {
    const loading = this.loading('Refreshing node ...');
    try {
      this.node = await this.nodesService.getNode(this.node.id);
      this.updateDependencies();
    } catch (error) {
      this.alert('Refresh Node', error);
    } finally {
      loading.dismiss();
    }
  }

  onShowEvent(event: OnmsEvent) {
    this.navCtrl.push(EventPage, {event: event});
  }

  onShowOutage(outage: OnmsOutage) {
    this.navCtrl.push(OutagePage, {outage: outage});
  }

  onShowResources() {
    if (this.serversService.supports(OnmsFeatures.Measurements)) {
      this.navCtrl.push(ResourcesPage, {node: this.node});
    } else {
      this.alert('Warning', 'Feature not supported on this version.');
    }
  }

  onShowAssets() {
    this.navCtrl.push(AssetsPage, {node: this.node});
  }

  async onForceRescan() {
    const loading = this.loading('Sending force rescan...');
    try {
      const event = { uei: 'uei.opennms.org/internal/capsd/forceRescan', nodeid: this.node.id };
      await this.eventsService.sendEvent(event);
      this.toast('Force rescan event has been sent!');
    } catch (error) {
      this.alert('Force Rescan Error', error);
    } finally {
      loading.dismiss();
    }
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

  private async updateDependencies() {
    try {
      const labelFilter = new OnmsApiFilter('node.label', this.node.label);
      const outstanding = new OnmsApiFilter('ifRegainedService', 'null');
      let promises = [];
      promises.push(this.nodesService.getIpInterfaces(this.node.id));
      promises.push(this.nodesService.getSnmpInterfaces(this.node.id));
      promises.push(this.availabilityService.getAvailabilityForNode(this.node.id));
      promises.push(this.eventsService.getEvents(0, [labelFilter], 5));
      promises.push(this.outagesService.getOutages(0, [labelFilter, outstanding], 5));
      promises.push(this.nodesService.isNodeAffectedByScheduledOutage(this.node.id));
      [ this.node.ipInterfaces,
        this.node.snmpInterfaces,
        this.availability,
        this.events,
        this.outages,
        this.inScheduledOutage ] = await Promise.all(promises);
    } catch (error) {
      this.alert('Error', `Cannot update dependencies: ${error}`);
    }
  }

  private async saveCoordinates(coords: {latitude: number, longitude: number}) {
    this.node.assetRecord.latitude = coords.latitude;
    this.node.assetRecord.longitude = coords.longitude;
    const loading = this.loading('Updating node assets...');
    try {
      await this.nodesService.updateAssets(this.node.id, coords);
      this.toast('Coordinates updated!');
    } catch (error) {
      this.alert('Update Assets Error', error);
    } finally {
      loading.dismiss();
    }
  }

}
