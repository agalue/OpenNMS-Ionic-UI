import { Component } from '@angular/core';
import { NavParams, Toggle } from 'ionic-angular';

import { GeolocationQuery } from '../../services/onms-maps';

@Component({
  selector: 'page-regional-status-options',
  templateUrl: 'regional-status-options.html'
})
export class RegionalStatusOptionsPage {

  query: GeolocationQuery;
  strategyValue: boolean;
  private onChange: (query:GeolocationQuery) => void;

  constructor(private navParams: NavParams) {
    this.query = navParams.get('query');
    this.onChange = navParams.get('onChange');
    this.strategyValue = this.query.strategy == 'Outages';
  }

  onStrategyChange(toggle: Toggle) {
    this.query.strategy = toggle.checked ? 'Outages' : 'Alarms';
    this.onChange(this.query);
  }

  onChangeAcked() {
    this.onChange(this.query);
  }

}
