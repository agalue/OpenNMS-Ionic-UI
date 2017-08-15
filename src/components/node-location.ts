import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingController, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import * as Leaflet from 'leaflet';

import { OnmsNode } from '../models/onms-node';
import { OnmsMapsService } from '../services/onms-maps';

@Component({
  selector: 'node-location',
  templateUrl: 'node-location.html'
})
export class NodeLocationComponent implements OnChanges {

  @Input('node') node: OnmsNode;
  @Input('loadingCtrl') loadingCtrl: LoadingController;
  @Input('alertCtrl') alertCtrl: AlertController;
  @Output('onSelect') onSelect = new EventEmitter();
  @Output('onSave') onSave = new EventEmitter();

  private map: Leaflet.Map;
  private mapOptions: Leaflet.MapOptions = {
    tap: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    maxZoom: 18
  };

  constructor(
    private geolocation: Geolocation,
    private mapService: OnmsMapsService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => this.drawMap(), 500); // The DIV has to exist prior rendering the map
  }

  async onUseCurrentLocation() {
    const loading = this.loadingCtrl.create({
      content: 'Getting your location...'
    });
    loading.present();
    let coords = null;
    try {
      let position = await this.geolocation.getCurrentPosition();
      coords = position.coords;
    } catch (error) {
      this.alert('Could not get location', error.message);
    } finally {
      loading.dismiss();
    }
    const alert = this.alertCtrl.create({
      title: 'Set Node Location',
      subTitle: `latitude=${coords.latitude}, longitude=${coords.longitude}`,
      message: 'Are you want to override the node location? This cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: () => this.onSave.emit({ latitude: coords.latitude, longitude: coords.longitude})
        }
      ]
    });
    alert.present();
  }

  onSelectOnMap() {
    this.onSelect.emit();
  }

  private drawMap() {
    if (this.node.hasLocation()) {
      let location: [number,number] = this.node.getLocation();
      if (!this.map) {
        this.map = this.mapService.createMap('map', this.mapOptions);
      }
      this.map.setView(location, 16);
      Leaflet.marker(location).addTo(this.map);
    }
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