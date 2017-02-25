import { HostListener, Directive } from '@angular/core';

@Directive({
    selector: '[elastic]'
})
export class ElasticDirective {

  @HostListener('input',['$event.target'])

  onInput(nativeElement: any): void {
    nativeElement.style.height = nativeElement.scrollHeight + "px";
  }

}