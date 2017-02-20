import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { GeolocationQuery, GeolocationInfo, SeverityInfo, OnmsMapsService } from '../../services/onms-maps';

import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'page-regional-status',
  templateUrl: 'regional-status.html'
})
export class RegionalStatusPage {

  query: GeolocationQuery = new GeolocationQuery();

  private tileLayer: string = 'https://tiles.opennms.org/{z}/{x}/{y}.png';
  private map: Leaflet.Map;
  private markersGroup: Leaflet.MarkerClusterGroup;

  private mapOptions: Leaflet.MapOptions = {
    zoom: 1,
    maxZoom: 15,
    tap: true,
    touchZoom: true,
    doubleClickZoom: true,
    zoomControl: false,
    dragging: true,
    attributionControl: false
  };

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
    this.map = Leaflet.map('map', this.mapOptions);
    Leaflet.tileLayer(this.tileLayer).addTo(this.map);
    this.initMarkerGroup();
  }

  private loadGeolocations() {
    this.mapService.getGeolocations(this.query)
      .then(locations => {
        this.resetMap(locations);
        this.centerOnMap();
      })
      .catch(error => this.alert('Load Map', error));
  }

  private initMarkerGroup() {
    this.markersGroup = Leaflet.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      iconCreateFunction: (cluster: Leaflet.MarkerCluster) => {
        let severity = new SeverityInfo();
        cluster.getAllChildMarkers().forEach(m => {
          let s = (<Object>m)['data'] as SeverityInfo;
          if (severity.id < s.id) {
            severity = s;
          }
        });
        return Leaflet.divIcon({
          iconSize: Leaflet.point(30, 30),
          className: `myCluster ${severity.label}_`,
          html: cluster.getChildCount().toString()
        }) as Leaflet.Icon;
      }
    }).addTo(this.map);
  }

  private resetMap(locations: GeolocationInfo[]) {
    this.markersGroup.clearLayers();
    locations.forEach(location => {
      if (location.coordinates) {
        let icon = this.getIcon(location.severityInfo);
        let latlng = Leaflet.latLng(location.coordinates.latitude, location.coordinates.longitude);
        let marker = Leaflet.marker(latlng, { icon: icon });
        (<Object>marker)['data'] = location.severityInfo;
        this.markersGroup.addLayer(marker);
      }
    });
  }

  private centerOnMap() {
    if (this.markersGroup.getBounds().isValid()) {
      this.map.fitBounds(this.markersGroup.getBounds(), {padding: [15, 15]});
    } else {
      this.map.setView([34.5133, -94.1629], 1); // center of earth
    }
  }

  private getIcon(severityInfo: SeverityInfo) : Leaflet.Icon {
    let severity = severityInfo && severityInfo.label ? severityInfo.label : 'Normal';
    return Leaflet.icon({
        iconUrl: `/assets/images/severity${severity}.png`,
        iconRetinaUrl: `/assets/images/${severity}@2x.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
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
