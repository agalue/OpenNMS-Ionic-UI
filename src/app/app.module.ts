import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { MyApp } from './app.component';
import { MyPages } from './app.pages';

import { HttpService } from '../services/http';
import { OnmsServersService } from '../services/onms-servers';
import { OnmsAvailabilityService } from '../services/onms-availability';
import { OnmsEventsService } from '../services/onms-events';
import { OnmsAlarmsService } from '../services/onms-alarms';
import { OnmsOutagesService } from '../services/onms-outages';
import { OnmsNotificationsService } from '../services/onms-notifications';

@NgModule({
  declarations: MyPages,
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: MyPages,
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Storage,
    HttpService,
    OnmsServersService,
    OnmsAvailabilityService,
    OnmsEventsService,
    OnmsAlarmsService,
    OnmsOutagesService,
    OnmsNotificationsService
  ]
})
export class AppModule {}
