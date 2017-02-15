import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { OutagePage } from '../outage/outage';
import { OnmsOutage } from '../../models/onms-outage';
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
      .catch(() => loading.dismiss());
  }

  onShowOutage(outage: OnmsOutage) {
    this.navCtrl.push(OutagePage, {outage: outage});
  }

  onSearchOutages(event: any) {
    this.outageFilter = event.target.value;
    this.onRefresh();
  }

  onCancelSearch(event: any) {
    if (this.outageFilter) {
      this.outageFilter = null;
      this.onRefresh();
    }
  }

  onInfiniteScroll(infiniteScroll: any) {
    this.start += 10;
    this.loadOutages().then((canScroll: boolean) => {
      infiniteScroll.complete();
      infiniteScroll.enable(canScroll);
    });
  }

  formatUei(uei: string) {
    let ret: string = uei.replace(/^.*\//g, '');
    ret = ret.search(/_/) == -1 ? ret.replace(/([A-Z])/g, ' $1') : ret.replace('_', ' ');
    return ret.charAt(0).toUpperCase() + ret.slice(1);
  }

  getIconColor(outage: OnmsOutage, strong: boolean = false) {
    return (outage.serviceRegainedEvent ? 'Normal' : 'Major') + (strong ? '_' : '');
  }

  private loadOutages() {
    return new Promise(resolve => {
      this.outagesService.getOutages(this.start, this.outageFilter)
        .then(outages => {
          outages.forEach(e => this.outages.push(e));
          resolve(true);
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
