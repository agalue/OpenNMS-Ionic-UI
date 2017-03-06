import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'macAddress'})
export class MacAddressPipe implements PipeTransform {

   transform(value: string): string {
     if (!value) return null;
     let parts: string[] = value.toUpperCase().match(/.{1,2}/g);
     return parts.join(':');
  }

}