import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { AlarmOptions } from '../../models/onms-api-filter';

@Component({
  selector: 'page-alarms-options',
  templateUrl: 'alarms-options.html'
})
export class AlarmsOptionsPage {

  options: AlarmOptions
  private onChange: (options:AlarmOptions) => void;

  constructor(private navParams: NavParams) {}

  ionViewWillLoad() {
    this.options = this.navParams.get('options');
    this.onChange = this.navParams.get('onChange');
  }

  onOptionChange() {
    this.onChange(this.options);
  }

}
