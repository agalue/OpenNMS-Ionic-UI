import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import { OnmsServer } from '../../models/onms-server';
import { OnmsOutage } from '../../models/onms-outage';

import { OutagePage } from '../outage/outage';

import { OnmsServersService } from '../../services/onms-servers';
import { OnmsOutagesService } from '../../services/onms-outages';

@Component({
  selector: 'page-outages',
  templateUrl: 'outages.html'
})
export class OutagesPage {

  noOutages = false;
  outages: OnmsOutage[] = [];
  outageFilter: string;
  onmsServer: OnmsServer;

  private start: number = 0;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private serversService: OnmsServersService,
    private outagesService: OnmsOutagesService
  ) {}

  ionViewWillLoad() {
    this.serversService.getDefaultServer()
      .then((server: OnmsServer) => {
        this.onmsServer = server;
        this.onRefresh();
      })
      .catch(error => console.log(error));
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

  loadOutages() {
    return new Promise(resolve => {
      this.outagesService.getOutages(this.onmsServer, this.start, this.outageFilter)
        .then(outages => {
          outages.forEach(e => this.outages.push(e));
          resolve(true);
        });
    });
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

  doInfinite(infiniteScroll: any) {
    console.log('doInfinite, start is currently ' + this.start);
    this.start += 10;
    this.loadOutages().then(() => infiniteScroll.complete());
  }

  formatUei(uei: string) {
    let ret: string = uei.replace(/^.*\//g, '');
    ret = ret.search(/_/) == -1 ? ret.replace(/([A-Z])/g, ' $1') : ret.replace('_', ' ');
    return ret.charAt(0).toUpperCase() + ret.slice(1);
  }

  getIconColor(outage: OnmsOutage, strong: boolean = false) {
    return (outage.serviceRegainedEvent ? 'Normal' : 'Major') + (strong ? '_' : '');
  }
}
