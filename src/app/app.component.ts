import { Component, ViewChild, OnDestroy } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Badge } from '@ionic-native/badge';
import { Subscription } from 'rxjs/Rx';

import { HomePage } from '../pages/home/home';
import { EventsPage } from '../pages/events/events';
import { AlarmsPage } from '../pages/alarms/alarms';
import { OutagesPage } from '../pages/outages/outages';
import { NotificationsPage } from '../pages/notifications/notifications';
import { NodesPage } from '../pages/nodes/nodes';
import { NodeMapsPage } from '../pages/node-maps/node-maps';
import { RegionalStatusPage } from '../pages/regional-status/regional-status';
import { SnmpConfigPage } from '../pages/snmp-config/snmp-config';
import { RequisitionsPage } from '../pages/requisitions/requisitions';
import { ServersPage } from '../pages/servers/servers';
import { SetupPage } from '../pages/setup/setup';

import { OnmsServer } from '../models/onms-server';
import { OnmsServersService, OnmsFeatures } from '../services/onms-servers';
import { HttpService } from '../services/http';
import { OnmsAlarmsService } from '../services/onms-alarms';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnDestroy {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  onmsServer: OnmsServer;
  groups: Array<{name: string, pages: Array<{title: string, icon: string, component: any}>}>;

  private subscription: Subscription;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private badge: Badge,
    private splashScreen: SplashScreen,
    private httpService: HttpService,
    private serversConfig: OnmsServersService,
    private alarmsService: OnmsAlarmsService,
  ) {
    httpService.register();
    this.initializeServer();
    this.initializeApp();
  }

  private async initializeApp() {
    await this.platform.ready();
    // Okay, so the platform is ready and our plugins are available.
    // Here you can do any higher level native things you might need.
    this.statusBar.styleDefault();
    this.splashScreen.hide();
    this.initializeBadges();
  }

  private async initializeServer() {
    this.subscription = this.serversConfig.defaultUpdated.subscribe(defaultServer => this.onmsServer = defaultServer);
    try {
      let defaultServer = await this.serversConfig.getDefaultServer();
      this.initializeGroups();
      this.rootPage = defaultServer ? HomePage : SetupPage;
    } catch (error) {
      console.log(error);
    }
  }

  private initializeGroups() {
    this.groups = [
      {
        name: 'Status',
        pages: [
          { title: 'Home', icon: 'home', component: HomePage },
          { title: 'Events', icon: 'information-circle', component: EventsPage },
          { title: 'Alarms', icon: 'alarm', component: AlarmsPage },
          { title: 'Outages', icon: 'thunderstorm', component: OutagesPage },
          { title: 'Notifications', icon: 'notifications', component: NotificationsPage },
          { title: 'Nodes', icon: 'laptop', component: NodesPage }
        ]
      },{
        name: 'Maps',
        pages: [
          { title: 'Node Maps', icon: 'compass', component: NodeMapsPage }
        ]
      },{
        name: 'Admin',
        pages: [
          { title: 'SNMP Config', icon: 'hammer', component: SnmpConfigPage },
          { title: 'Requisitions', icon: 'settings', component: RequisitionsPage },
          { title: 'Servers', icon: 'desktop', component: ServersPage }
        ]
      }
    ];
    if (this.serversConfig.supports(OnmsFeatures.RegionalStatus)) {
      this.groups[1].pages.push({ title: 'Regional Status', icon: 'map', component: RegionalStatusPage })
    }
  }

  private async initializeBadges() {
    if (!this.platform.is('cordova')) {
      console.warn("Push notifications not initialized. Cordova is not available - Run in physical device");
      return;
    }
    try {
      await this.badge.hasPermission();
      this.subscribeToPause();
    } catch (error) {
      console.error(error);
    }
  }

  private subscribeToPause() {
    this.platform.pause.subscribe(async() => {
      try {
        let alarms = await this.alarmsService.getAlarmCount();
        alarms == 0 ? this.badge.clear() : this.badge.set(alarms);
      } catch (error) {
        console.error(error);
      }
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
