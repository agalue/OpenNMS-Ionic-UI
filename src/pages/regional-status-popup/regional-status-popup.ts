import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { GeolocationInfo } from '../../services/onms-maps';

@Component({
  selector: 'page-regional-status-popup',
  templateUrl: 'regional-status-popup.html'
})
export class RegionalStatusPopupPage {

 locations: GeolocationInfo[] = [];

  constructor(private navParams: NavParams) {
    this.locations = navParams.get('locations');
  }

}
