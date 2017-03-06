import { Component } from '@angular/core';
import { AlertController, PopoverController } from 'ionic-angular';

import { RegionalStatusOptionsPage } from '../regional-status-options/regional-status-options';
import { RegionalStatusPopupPage } from '../regional-status-popup/regional-status-popup';
import { GeolocationQuery, GeolocationInfo, SeverityLegendControl, OnmsMapsService } from '../../services/onms-maps';

import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'page-regional-status',
  templateUrl: 'regional-status.html'
})
export class RegionalStatusPage {

  query: GeolocationQuery = new GeolocationQuery();

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
    private popoverCtrl: PopoverController,
    private mapService: OnmsMapsService
  ) {}

  ionViewDidLoad() {
    this.initMap();
    this.loadGeolocations();
  }

  onShowOptions(event: any) {
    let popover = this.popoverCtrl.create(RegionalStatusOptionsPage, {
      query: this.query,
      onChange: (query:GeolocationQuery) => {
        this.query = query;
        this.loadGeolocations();
      }
    });
    popover.present({ ev: event });
  }

  onCenter() {
    this.mapService.centerMap(this.map, this.markersGroup);
  }

  private initMap() {
    if (this.map) return;
    this.map = this.mapService.createMap('regional-map', this.mapOptions);
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
    this.mapService.getAlarmGeolocations(this.query)
      .then(locations => {
        this.mapService.resetMap(this.markersGroup, locations, event => {
          let location: GeolocationInfo = event.target['data'] as GeolocationInfo;
          const popup = this.popoverCtrl.create(RegionalStatusPopupPage, { locations: [location] });
          popup.present({ ev: event['originalEvent'] });
        });
        this.onCenter();
      })
      .catch(error => this.alert('Load Map', error));
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
