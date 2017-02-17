import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'className'})
export class ClassNamePipe implements PipeTransform {

   transform(value: string): string {
     let parts: string[] = value.split('.');
     return parts[parts.length-1];
  }

}