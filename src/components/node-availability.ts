import { Component, Input } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';

import { OnmsNodeAvailability } from '../models/onms-node-availability';

@Component({
  selector: 'node-availability',
  templateUrl: 'node-availability.html'
})
export class NodeAvailabilityComponent {

  @Input('availability') availability: OnmsNodeAvailability;

  availSearchKeyword: string = '';

  constructor(private keyboard: Keyboard) { }

  onSearchAvailInterfaces(event: any) {
    this.availSearchKeyword = event.target.value;
    setTimeout(() => this.keyboard.close(), 500);
  }

  getAvailabilityColor(avail: number) : string {
    if (avail > 99) return 'Normal';
    if (avail > 95) return 'Warning';
    return 'Critical';
  }

}