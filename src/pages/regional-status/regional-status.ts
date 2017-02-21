import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { GeolocationQuery, OnmsMapsService } from '../../services/onms-maps';

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

  constructor(
    private alertCtrl: AlertController,
    private mapService: OnmsMapsService
  ) {}

  ionViewDidLoad() {
    this.initMap();
    this.loadGeolocations();
  }

  onShowOptions() {
    this.alert('Commin Soon!', 'Not implemented jet, sorry :('); // FIXME
  }

  private initMap() {
    if (this.map) return;
    this.map = this.mapService.createMap('map');
    this.markersGroup = this.mapService.createMarkerGroup().addTo(this.map);
  }

  private loadGeolocations() {
    this.mapService.getGeolocations(this.query)
      .then(locations => {
        this.mapService.resetMap(this.markersGroup, locations);
        this.centerOnMap();
      })
      .catch(error => this.alert('Load Map', error));
  }

  private centerOnMap() {
    if (this.markersGroup.getBounds().isValid()) {
      this.map.fitBounds(this.markersGroup.getBounds(), {padding: [15, 15]});
    } else {
      this.map.setView([34.5133, -94.1629], 1); // center of earth
    }
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
