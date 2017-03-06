import { Pipe, PipeTransform } from '@angular/core';

import { OnmsSnmpInterface } from '../models/onms-snmp-interface';

@Pipe({name: 'snmpIntfFilter'})
export class SnmpInterfaceFilterPipe implements PipeTransform {

  transform(interfaces: OnmsSnmpInterface[], keyword: string): OnmsSnmpInterface[] {
    if (keyword == undefined || keyword == '') return interfaces;
    return interfaces.filter(intf => intf.contains(keyword));
  }

}