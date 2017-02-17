import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { MyApp } from './app.component';

import { ClassNamePipe } from '../pipes/class-name';

import { SetupPage } from '../pages/setup/setup';
import { ServersPage } from '../pages/servers/servers';
import { ServerPage } from '../pages/server/server';
import { HomePage } from '../pages/home/home';
import { EventsPage } from '../pages/events/events';
import { EventPage } from '../pages/event/event';
import { AlarmsPage } from '../pages/alarms/alarms';
import { AlarmPage } from '../pages/alarm/alarm';
import { OutagesPage } from '../pages/outages/outages';
import { OutagePage } from '../pages/outage/outage';
import { NotificationsPage } from '../pages/notifications/notifications';
import { NotificationPage } from '../pages/notification/notification';
import { NodesPage } from '../pages/nodes/nodes';
import { NodePage } from '../pages/node/node';
import { SnmpConfigPage } from '../pages/snmp-config/snmp-config';
import { RequisitionsPage } from '../pages/requisitions/requisitions';
import { RequisitionPage } from '../pages/requisition/requisition';
import { RequisitionNodePage } from '../pages/requisition-node/requisition-node';
import { RequisitionInterfacePage } from '../pages/requisition-interface/requisition-interface';
import { RequisitionAssetPage }from '../pages/requisition-asset/requisition-asset';
import { ForeignSourcePage } from '../pages/foreign-source/foreign-source';
import { PolicyPage } from '../pages/policy/policy';
import { DetectorPage } from '../pages/detector/detector';

import { HttpService } from '../services/http';
import { OnmsServersService } from '../services/onms-servers';
import { OnmsAvailabilityService } from '../services/onms-availability';
import { OnmsEventsService } from '../services/onms-events';
import { OnmsAlarmsService } from '../services/onms-alarms';
import { OnmsOutagesService } from '../services/onms-outages';
import { OnmsNotificationsService } from '../services/onms-notifications';
import { OnmsNodesService } from '../services/onms-nodes';
import { OnmsSnmpConfigService } from '../services/onms-snmp-config';
import { OnmsRequisitionsService } from '../services/onms-requisitions';

@NgModule({
  declarations: [
    MyApp,
    ClassNamePipe,
    SetupPage,
    ServersPage,
    ServerPage,
    HomePage,
    EventsPage,
    EventPage,
    AlarmsPage,
    AlarmPage,
    OutagesPage,
    OutagePage,
    NotificationsPage,
    NotificationPage,
    NodesPage,
    NodePage,
    SnmpConfigPage,
    RequisitionsPage,
    RequisitionPage,
    RequisitionNodePage,
    RequisitionInterfacePage,
    RequisitionAssetPage,
    ForeignSourcePage,
    PolicyPage,
    DetectorPage    
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
    AlarmPage,
    OutagesPage,
    OutagePage,
    NotificationsPage,
    NotificationPage,
    NodesPage,
    NodePage,
    SnmpConfigPage,
    RequisitionsPage,
    RequisitionPage,
    RequisitionNodePage,
    RequisitionInterfacePage,
    RequisitionAssetPage,
    ForeignSourcePage,
    PolicyPage,
    DetectorPage    
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Storage,
    HttpService,
    OnmsServersService,
    OnmsAvailabilityService,
    OnmsEventsService,
    OnmsAlarmsService,
    OnmsOutagesService,
    OnmsNotificationsService,
    OnmsNodesService,
    OnmsSnmpConfigService,
    OnmsRequisitionsService
  ]
})
export class AppModule {}
