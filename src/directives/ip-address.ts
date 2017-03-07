import { Directive } from '@angular/core';
import { AbstractControl, Validator, NG_VALIDATORS } from '@angular/forms';

import * as Address6 from 'ip-address/lib/ipv6';

export function validateIpAddress(control: AbstractControl) : {[key: string]: boolean} {
  let isValid = false;
  const ipAddress = control.value;
  if (ipAddress) {
    if (Address6.fromAddress4(ipAddress).isValid()) {
      isValid = true;
    } else if (new Address6(ipAddress).isValid()) {
      isValid = true;
    }
  }
  return isValid ? null : { ipAddress: true }
}

@Directive({
  selector: '[ipAddress]',
  providers: [{provide: NG_VALIDATORS, useExisting: IpAddressValidatorDirective, multi: true}]
})
export class IpAddressValidatorDirective implements Validator {
  validate(control: AbstractControl): {[key: string]: boolean} {
    return validateIpAddress(control);
  }
}
