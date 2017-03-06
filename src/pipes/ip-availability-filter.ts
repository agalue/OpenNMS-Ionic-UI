import { Pipe, PipeTransform } from '@angular/core';

import { OnmsIpInterfaceAvailability } from '../models/onms-ip-interface-availability';

@Pipe({name: 'ipAvailFilter'})
export class IpAvailabilityFilterPipe implements PipeTransform {

  transform(interfaces: OnmsIpInterfaceAvailability[], keyword: string): OnmsIpInterfaceAvailability[] {
    if (keyword == undefined || keyword == '') return interfaces;
    return interfaces.filter(intf => intf.contains(keyword));
  }

}