import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import * as Leaflet from 'leaflet';

import { OnmsNode } from '../../models/onms-node';

@Component({
  selector: 'page-set-location',
  templateUrl: 'set-location.html'
})
export class SetLocationPage {

  location: [number,number] = [34.5133, -94.1629]; // center of earth 
  marker: Leaflet.Marker;

  private map: Leaflet.Map;
  private tileLayer: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private mapOptions: Leaflet.MapOptions = {
    tap: true,
    touchZoom: true,
    doubleClickZoom: true,
    maxZoom: 18,
    zoomControl: false,
    dragging: true,
    attributionControl: false
  };

  constructor(private viewCtrl: ViewController, private navParams: NavParams) {
  }

  ionViewDidLoad() {
    let node: OnmsNode = this.navParams.get('node');
    this.map = Leaflet.map('set-location-map', this.mapOptions);
    Leaflet.tileLayer(this.tileLayer).addTo(this.map);
    if (node.hasLocation()) {
      this.location = [ node.assetRecord.latitude, node.assetRecord.longitude ];
      this.marker = Leaflet.marker(this.location);
      this.map.setView(this.location, 16);
      this.map.addLayer(this.marker);
    } else {
      this.map.setView(this.location, 1);
    }
    this.map.on('click', event => {
      console.log(event);
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = Leaflet.marker(event['latlng']);
      this.map.addLayer(this.marker);
    });
  }

  onConfirm() {
    this.viewCtrl.dismiss({ latitude: this.marker.getLatLng().lat, longitude: this.marker.getLatLng().lng });
  }

  onAbort() {
    this.viewCtrl.dismiss();
  }

}
