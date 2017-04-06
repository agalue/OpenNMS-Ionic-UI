import { Component, Input } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';

import { OnmsIpInterface } from '../models/onms-ip-interface';

@Component({
  selector: 'node-ip-interfaces',
  templateUrl: 'node-ip-interfaces.html'
})
export class NodeIpInterfacesComponent {

  @Input('ipInterfaces') ipInterfaces: OnmsIpInterface[];

  ipSearchKeyword: string = '';

  constructor(private keyboard: Keyboard) { }

  onSearchIpInterfaces(event: any) {
    this.ipSearchKeyword = event.target.value;
    setTimeout(() => this.keyboard.close(), 500);
  }

}