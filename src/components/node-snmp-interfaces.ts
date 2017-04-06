import { Component, Input } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';

import { OnmsSnmpInterface } from '../models/onms-snmp-interface';
import { IANA_IFTYPES } from '../models/iana-iftypes';

@Component({
  selector: 'node-snmp-interfaces',
  templateUrl: 'node-snmp-interfaces.html'
})
export class NodeSnmpInterfacesComponent {

  @Input('snmpInterfaces') snmpInterfaces: OnmsSnmpInterface[];

  snmpSearchKeyword: string = '';

  constructor(private keyboard: Keyboard) { }

  onSearchSnmpInterfaces(event: any) {
    this.snmpSearchKeyword = event.target.value;
    setTimeout(() => this.keyboard.close(), 500);
  }

  getInterfaceType(ifType: number) : string {
    return IANA_IFTYPES[ifType];
  }

}