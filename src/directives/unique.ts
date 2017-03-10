import { AbstractControl, ValidatorFn } from '@angular/forms';

export function validateUnique(blacklist: string[]): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    return blacklist.indexOf(control.value) == -1 ? null : { unique: false };
  };
}
