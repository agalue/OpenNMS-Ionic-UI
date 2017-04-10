import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { Badge } from '@ionic-native/badge';
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

// Main Component

import { MyApp } from './app.component';

// Angular Pipes

import { ClassNamePipe } from '../pipes/class-name';
import { MacAddressPipe } from '../pipes/mac-address';
import { IpAvailabilityFilterPipe } from '../pipes/ip-availability-filter';
import { IpInterfaceFilterPipe } from '../pipes/ip-interface-filter';
import { SnmpInterfaceFilterPipe } from '../pipes/snmp-interface-filter';
import { RequisitionFilterPipe } from '../pipes/req-filter';
import { RequisitionNodeFilterPipe } from '../pipes/req-node-filter';

// Angular Directives

import { ElasticDirective } from '../directives/elastic';
import { IpAddressValidatorDirective } from '../directives/ip-address';

// Angular Components

import { OnmsTitleComponent } from '../components/title';
import { OnmsBackshiftComponent } from '../components/backshift';
import { AlarmsSummaryComponent } from '../components/summary-alarms';
import { OutagesSummaryComponent } from '../components/summary-outages';
import { NodeAvailabilityComponent } from '../components/node-availability';
import { NodeIpInterfacesComponent } from '../components/node-ip-interfaces';
import { NodeSnmpInterfacesComponent } from '../components/node-snmp-interfaces';
import { NodeLocationComponent } from '../components/node-location';

// Angular Services

import { HttpService } from '../services/http';
import { OnmsUIService } from '../services/onms-ui';
import { OnmsServersService } from '../services/onms-servers';
import { OnmsAvailabilityService } from '../services/onms-availability';
import { OnmsEventsService } from '../services/onms-events';
import { OnmsAlarmsService } from '../services/onms-alarms';
import { OnmsOutagesService } from '../services/onms-outages';
import { OnmsNotificationsService } from '../services/onms-notifications';
import { OnmsNodesService } from '../services/onms-nodes';
import { OnmsSnmpConfigService } from '../services/onms-snmp-config';
import { OnmsRequisitionsService } from '../services/onms-requisitions';
import { OnmsMapsService } from '../services/onms-maps';

// Ionic Pages

import { SetupPage } from '../pages/setup/setup';
import { ServersPage } from '../pages/servers/servers';
import { ServerPage } from '../pages/server/server';
import { HomePage } from '../pages/home/home';
import { EventsPage } from '../pages/events/events';
import { EventPage } from '../pages/event/event';
import { AlarmsPage } from '../pages/alarms/alarms';
import { AlarmsOptionsPage } from '../pages/alarms-options/alarms-options';
import { AlarmPage } from '../pages/alarm/alarm';
import { OutagesPage } from '../pages/outages/outages';
import { OutagePage } from '../pages/outage/outage';
import { NotificationsPage } from '../pages/notifications/notifications';
import { NotificationPage } from '../pages/notification/notification';
import { NodesPage } from '../pages/nodes/nodes';
import { NodePage } from '../pages/node/node';
import { AssetsPage } from '../pages/assets/assets';
import { ResourcesPage } from '../pages/resources/resources';
import { ResourceGraphsPage } from '../pages/resource-graphs/resource-graphs';
import { SnmpConfigPage } from '../pages/snmp-config/snmp-config';
import { RequisitionsPage } from '../pages/requisitions/requisitions';
import { RequisitionPage } from '../pages/requisition/requisition';
import { RequisitionNodePage } from '../pages/requisition-node/requisition-node';
import { RequisitionInterfacePage } from '../pages/requisition-interface/requisition-interface';
import { RequisitionAssetPage }from '../pages/requisition-asset/requisition-asset';
import { RequisitionCategoryPage } from '../pages/requisition-category/requisition-category';
import { ForeignSourcePage } from '../pages/foreign-source/foreign-source';
import { PolicyPage } from '../pages/policy/policy';
import { DetectorPage } from '../pages/detector/detector';
import { RegionalStatusPage } from '../pages/regional-status/regional-status';
import { RegionalStatusOptionsPage } from '../pages/regional-status-options/regional-status-options';
import { MapStatusPopupPage } from '../pages/map-status-popup/map-status-popup';
import { NodeMapsPage } from '../pages/node-maps/node-maps';
import { SetLocationPage } from '../pages/set-location/set-location';

// Module Declaration

@NgModule({
  declarations: [
    // Pipes
    ClassNamePipe,
    MacAddressPipe,
    IpAvailabilityFilterPipe,
    IpInterfaceFilterPipe,
    SnmpInterfaceFilterPipe,
    RequisitionFilterPipe,
    RequisitionNodeFilterPipe,
    // Directives,
    ElasticDirective,
    IpAddressValidatorDirective,
    // Components
    OnmsTitleComponent,
    OnmsBackshiftComponent,
    AlarmsSummaryComponent,
    OutagesSummaryComponent,
    NodeAvailabilityComponent,
    NodeIpInterfacesComponent,
    NodeSnmpInterfacesComponent,
    NodeLocationComponent,
    // Pages
    MyApp,
    SetupPage,
    ServersPage,
    ServerPage,
    HomePage,
    EventsPage,
    EventPage,
    AlarmsPage,
    AlarmsOptionsPage,
    AlarmPage,
    OutagesPage,
    OutagePage,
    NotificationsPage,
    NotificationPage,
    NodesPage,
    NodePage,
    AssetsPage,
    ResourcesPage,
    ResourceGraphsPage,
    SnmpConfigPage,
    RequisitionsPage,
    RequisitionPage,
    RequisitionNodePage,
    RequisitionInterfacePage,
    RequisitionAssetPage,
    RequisitionCategoryPage,
    ForeignSourcePage,
    PolicyPage,
    DetectorPage,
    RegionalStatusPage,
    RegionalStatusOptionsPage,
    MapStatusPopupPage,
    NodeMapsPage,
    SetLocationPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp, {
      backButtonIcon: 'arrow-back',
      backButtonText: ''
    })
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
    AlarmsOptionsPage,
    AlarmPage,
    OutagesPage,
    OutagePage,
    NotificationsPage,
    NotificationPage,
    NodesPage,
    NodePage,
    AssetsPage,
    ResourcesPage,
    ResourceGraphsPage,
    SnmpConfigPage,
    RequisitionsPage,
    RequisitionPage,
    RequisitionNodePage,
    RequisitionInterfacePage,
    RequisitionAssetPage,
    RequisitionCategoryPage,
    ForeignSourcePage,
    PolicyPage,
    DetectorPage,
    RegionalStatusPage,
    RegionalStatusOptionsPage,
    MapStatusPopupPage,
    NodeMapsPage,
    SetLocationPage
  ],
  providers: [
    Badge,
    Geolocation,
    Keyboard,
    SocialSharing,
    SplashScreen,
    StatusBar,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HttpService,
    OnmsUIService,
    OnmsServersService,
    OnmsAvailabilityService,
    OnmsEventsService,
    OnmsAlarmsService,
    OnmsOutagesService,
    OnmsNotificationsService,
    OnmsNodesService,
    OnmsSnmpConfigService,
    OnmsRequisitionsService,
    OnmsMapsService
  ]
})
export class AppModule {}
