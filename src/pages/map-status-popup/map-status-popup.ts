import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { GeolocationInfo } from '../../services/onms-maps';

@Component({
  selector: 'page-map-status-popup',
  templateUrl: 'map-status-popup.html'
})
export class MapStatusPopupPage {

 locations: GeolocationInfo[] = [];

  constructor(private navParams: NavParams) {
    this.locations = navParams.get('locations');
  }

}
