import { Component } from '@angular/core';
import { AlertController, PopoverController, LoadingController } from 'ionic-angular';

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
  private locations: GeolocationInfo[] = [];

  constructor(
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
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

  onSearchNodes(event: any) {
    const keyword = event && event.target && event.target.value ? event.target.value : undefined;
    if (!keyword) return;
    const locations = this.locations.filter(l => l.contains(keyword));
    console.log(locations);
    this.updateMap(locations);
  }

  onCancelSearch(event: any) {
    this.updateMap(this.locations);
  }

  private initMap() {
    if (this.map) return;
    this.map = this.mapService.createMap('nodes-map', this.mapOptions);
    SeverityLegendControl.addToMap(this.map);
    this.markersGroup = this.mapService.createMarkerGroup().addTo(this.map);
    this.markersGroup.on('clusterclick', event => {
      let group = event['layer'] as Leaflet.MarkerClusterGroup;
      let locations = group.getAllChildMarkers().map(m => m['data']);
      const popup = this.popoverCtrl.create(RegionalStatusPopupPage, { locations: locations });
      popup.present({ ev: event['originalEvent'] });
    });
  }

  private loadGeolocations() {
    const loading = this.loadingCtrl.create({
      content: 'Loading nodes, please wait...'
    });
    loading.present();
    this.mapService.getNodeGeolocations()
      .then(locations => {
        this.locations = locations;
        this.updateMap(this.locations);
        loading.dismiss();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Load Nodes', error);
      });
  }

  private updateMap(locations: GeolocationInfo[]) {
    this.mapService.resetMap(this.markersGroup, locations, event => {
      let location: GeolocationInfo = event.target['data'] as GeolocationInfo;
      const popup = this.popoverCtrl.create(RegionalStatusPopupPage, { locations: [location] });
      popup.present({ ev: event['originalEvent'] });
    });
    this.onCenter();
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