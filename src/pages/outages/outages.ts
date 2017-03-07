import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { OutagePage } from '../outage/outage';
import { OnmsOutage } from '../../models/onms-outage';
import { OnmsApiFilter } from '../../models/onms-api-filter';
import { OnmsUIService } from '../../services/onms-ui';
import { OnmsOutagesService } from '../../services/onms-outages';

@Component({
  selector: 'page-outages',
  templateUrl: 'outages.html'
})
export class OutagesPage {

  noOutages = false;
  outages: OnmsOutage[] = [];
  outageFilter: string;

  private start: number = 0;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private uiService: OnmsUIService,
    private outagesService: OnmsOutagesService
  ) {}

  ionViewWillLoad() {
    this.onRefresh();
  }

  onRefresh() {
    const loading = this.loadingCtrl.create({
      content: 'Loading outages, please wait...'
    });
    loading.present();
    this.outages = [];
    this.start = 0;
    this.loadOutages()
      .then(() => {
        loading.dismiss();
        this.noOutages = this.outages.length == 0
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Load Error', error);
      });
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

  onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    this.loadOutages()
      .then((canScroll: boolean) => {
        infiniteScroll.complete();
        infiniteScroll.enable(canScroll);
      })
      .catch(error => this.alert('Load Error', error));
  }

  formatUei(uei: string) {
    return this.uiService.getFormattedUei(uei);
  }

  getIconColor(outage: OnmsOutage, strong: boolean = false) {
    return this.uiService.getOutageIconColor(outage, strong);
  }

  private loadOutages() {
    return new Promise((resolve, reject) => {
      const filter = new OnmsApiFilter('serviceLostEvent.eventDescr', this.outageFilter);
      this.outagesService.getOutages(this.start, [filter])
        .then(outages => {
          outages.forEach(e => this.outages.push(e));
          resolve(true);
        })
        .catch(error => reject(error))
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
