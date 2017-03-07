import { Component, Input } from '@angular/core';
import { Keyboard } from 'ionic-native';

import { OnmsNodeAvailability } from '../models/onms-node-availability';

@Component({
  selector: 'node-availability',
  templateUrl: 'node-availability.html'
})
export class NodeAvailabilityComponent {

  @Input('availability') availability: OnmsNodeAvailability;

  availSearchKeyword: string = '';

  onSearchAvailInterfaces(event: any) {
    this.availSearchKeyword = event.target.value;
    setTimeout(() => Keyboard.close(), 500);
  }

  getAvailabilityColor(avail: number) : string {
    if (avail > 99) return 'Normal';
    if (avail > 95) return 'Warning';
    return 'Critical';
  }

}