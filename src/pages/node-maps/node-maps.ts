import { Component } from '@angular/core';
import { LoadingController, AlertController, ToastController, PopoverController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { MapStatusPopupPage } from '../map-status-popup/map-status-popup';
import { GeolocationInfo, SeverityLegendControl, OnmsMapsService } from '../../services/onms-maps';

import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'page-node-maps',
  templateUrl: 'node-maps.html'
})
export class NodeMapsPage extends AbstractPage {

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
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
    private mapService: OnmsMapsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewDidLoad() {
    this.initMap();
    this.loadGeolocations();
  }

  onCenter() {
    this.mapService.centerMap(this.map, this.markersGroup);
  }

  onSearchNodes(event: any) {
    const keyword = event.target.value;
    if (!keyword) return;
    const locations = this.locations.filter(l => l.contains(keyword));
    this.updateMap(locations);
  }

  onClearSearch(event: any) {
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
      const popup = this.popoverCtrl.create(MapStatusPopupPage, { locations: locations });
      popup.present({ ev: event['originalEvent'] });
    });
  }

  private async loadGeolocations() {
    const loading = this.loading('Loading nodes, please wait...');
    try {
      this.locations = await this.mapService.getNodeGeolocations();
      this.updateMap(this.locations);
    } catch (error) {
      this.alert('Load Nodes', error);
    } finally {
      loading.dismiss();
    }
  }

  private updateMap(locations: GeolocationInfo[]) {
    this.mapService.resetMap(this.markersGroup, locations, event => {
      let location: GeolocationInfo = event.target['data'] as GeolocationInfo;
      const popup = this.popoverCtrl.create(MapStatusPopupPage, { locations: [location] });
      popup.present({ ev: event['originalEvent'] });
    });
    this.onCenter();
  }

}