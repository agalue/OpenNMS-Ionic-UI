import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { MyApp } from './app.component';

import { SetupPage } from '../pages/setup/setup';
import { ServersPage } from '../pages/servers/servers';
import { ServerPage } from '../pages/server/server';
import { HomePage } from '../pages/home/home';
import { EventsPage } from '../pages/events/events';
import { EventPage } from '../pages/event/event';
import { AlarmsPage } from '../pages/alarms/alarms';
import { OutagesPage } from '../pages/outages/outages';
import { NotificationsPage } from '../pages/notifications/notifications';
import { NodesPage } from '../pages/nodes/nodes';
import { SnmpConfigPage } from '../pages/snmp-config/snmp-config';
import { RequisitionsPage } from '../pages/requisitions/requisitions';

import { HttpUtilsService } from '../services/http-utils';
import { OnmsServersService } from '../services/onms-servers';
import { OnmsAvailabilityService } from '../services/onms-availability';
import { OnmsEventsService } from '../services/onms-events';

@NgModule({
  declarations: [
    MyApp,
    SetupPage,
    ServersPage,
    ServerPage,
    HomePage,
    EventsPage,
    EventPage,
    AlarmsPage,
    OutagesPage,
    NotificationsPage,
    NodesPage,
    SnmpConfigPage,
    RequisitionsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SetupPage,
    ServersPage,
    ServerPage,
    HomePage,
    EventsPage,
    EventPage,
    AlarmsPage,
    OutagesPage,
    NotificationsPage,
    NodesPage,
    SnmpConfigPage,
    RequisitionsPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Storage,
    HttpUtilsService,
    OnmsServersService,
    OnmsAvailabilityService,
    OnmsEventsService
  ]
})
export class AppModule {}
