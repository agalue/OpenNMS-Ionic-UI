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

  constructor(private navParams: NavParams) {
    this.options = navParams.get('options');
    this.onChange = navParams.get('onChange');
  }

  onOptionChange() {
    this.onChange(this.options);
  }

}
