import { Component, Input } from '@angular/core';
import { Keyboard } from 'ionic-native';

import { OnmsIpInterface } from '../models/onms-ip-interface';

@Component({
  selector: 'node-ip-interfaces',
  templateUrl: 'node-ip-interfaces.html'
})
export class NodeIpInterfacesComponent {

  @Input('ipInterfaces') ipInterfaces: OnmsIpInterface[];

  ipSearchKeyword: string = '';

  onSearchIpInterfaces(event: any) {
    this.ipSearchKeyword = event.target.value;
    setTimeout(() => Keyboard.close(), 500);
  }

}