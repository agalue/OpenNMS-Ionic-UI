import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor and *ngIf to avoid import BrowserModule

import { BackshiftComponent } from './backshift.component';

@NgModule( {
  declarations: [
    BackshiftComponent
  ],
  imports: [
    CommonModule
  ]
})
export class BackshiftModule {}