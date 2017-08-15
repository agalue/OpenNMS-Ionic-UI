import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { OutagePage } from '../outage/outage';
import { OnmsOutage } from '../../models/onms-outage';
import { OnmsApiFilter } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsOutagesService } from '../../services/onms-outages';

@Component({
  selector: 'page-outages',
  templateUrl: 'outages.html'
})
export class OutagesPage extends AbstractPage {

  noOutages = false;
  outages: OnmsOutage[] = [];
  outageFilter: string;

  private start: number = 0;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private uiService: OnmsUIService,
    private outagesService: OnmsOutagesService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.onRefresh();
  }

  async onRefresh() {
    const loading = this.loading('Loading outages, please wait...');
    this.outages = [];
    this.start = 0;
    try {
      await this.loadOutages();
      this.noOutages = this.outages.length == 0;
    } catch (error) {
      this.alert('Load Error', error);
    } finally {
      loading.dismiss();
    }
  }

  onShowOutage(outage: OnmsOutage) {
    this.navCtrl.push(OutagePage, {outage: outage});
  }

  onSearchOutages(event: any) {
    this.outageFilter = event.target.value;
    this.onRefresh();
  }

  onClearSearch(event: any) {
    if (this.outageFilter) {
      this.outageFilter = null;
      this.onRefresh();
    }
  }

  async onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    try {
      let canScroll = await this.loadOutages();
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    } catch (error) {
      this.alert('Load Error', error);
    }
  }

  formatUei(uei: string) {
    return this.uiService.getFormattedUei(uei);
  }

  getIconColor(outage: OnmsOutage, strong: boolean = false) {
    return this.uiService.getOutageIconColor(outage, strong);
  }

  private async loadOutages() : Promise<boolean> {
    const filter = new OnmsApiFilter('serviceLostEvent.eventDescr', this.outageFilter);
    let outages = await this.outagesService.getOutages(this.start, [filter]);
    this.outages.push(...outages);
    return true;
  }

}
