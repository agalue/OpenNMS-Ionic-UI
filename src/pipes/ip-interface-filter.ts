import { Pipe, PipeTransform } from '@angular/core';

import { OnmsIpInterface } from '../models/onms-ip-interface';

@Pipe({name: 'ipIntfFilter'})
export class IpInterfaceFilterPipe implements PipeTransform {

  transform(interfaces: OnmsIpInterface[], keyword: string): OnmsIpInterface[] {
    if (keyword == undefined || keyword == '') return interfaces;
    return interfaces.filter(intf => intf.contains(keyword));
  }

}