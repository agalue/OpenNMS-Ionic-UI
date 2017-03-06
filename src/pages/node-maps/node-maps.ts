import { Component } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';

import { RegionalStatusOptionsPage } from '../regional-status-options/regional-status-options';
import { RegionalStatusPopupPage } from '../regional-status-popup/regional-status-popup';
import { GeolocationQuery, GeolocationInfo, SeverityLegendControl, OnmsMapsService } from '../../services/onms-maps';

import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'page-node-maps',
  templateUrl: 'node-maps.html'
})
export class NodeMapsPage {

  private map: Leaflet.Map;
  private markersGroup: Leaflet.MarkerClusterGroup;
  private mapOptions: Leaflet.MapOptions = {
    tap: true,
    dragging: true,
    touchZoom: true,
    doubleClickZoom: true,
    maxZoom: 15,
    zoom: 1,
  };

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private mapService: OnmsMapsService
  ) {}

  ionViewDidLoad() {
    this.initMap();
    this.loadGeolocations();
  }

  onCenter() {
    this.mapService.centerMap(this.map, this.markersGroup);
  }

  private initMap() {
    if (this.map) return;
    this.map = this.mapService.createMap('map', this.mapOptions);
    SeverityLegendControl.addToMap(this.map);
    this.markersGroup = this.mapService.createMarkerGroup().addTo(this.map);
  }

  private loadGeolocations() {
    const loading = this.loadingCtrl.create({
      content: 'Loading nodes, please wait...'
    });
    loading.present();
    this.mapService.getNodeGeolocations()
      .then(locations => {
        this.mapService.resetMap(this.markersGroup, locations);
        this.onCenter();
        loading.dismiss();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Load Map', error);
      });
  }

  private alert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: title,
      message: message,
      buttons: ['Ok']
    });
    alert.present();
  }

}