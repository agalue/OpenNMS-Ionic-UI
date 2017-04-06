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
import { OnmsServersService } from '../services/onms-servers';
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
    this.initializeApp();

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
          { title: 'Regional Status', icon: 'map', component: RegionalStatusPage },
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

    httpService.register();

    this.subscription = serversConfig.defaultUpdated.subscribe(defaultServer => this.onmsServer = defaultServer);
    serversConfig.getDefaultServer()
      .then(defaultServer => this.rootPage = defaultServer ? HomePage : SetupPage)
      .catch(error => console.log(error));
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initializeBadges();
    });
  }

  initializeBadges() {
    if (!this.platform.is('cordova')) {
      console.warn("Push notifications not initialized. Cordova is not available - Run in physical device");
      return;
    }
    this.badge.hasPermission()
      .then(() => this.subscribeToPause())
      .catch(error => console.error(error));
  }

  subscribeToPause() {
    this.platform.pause.subscribe(() => {
      this.alarmsService.getAlarmCount()
        .then(alarms => alarms == 0 ? this.badge.clear() : this.badge.set(alarms))
        .catch(error => console.error(error));
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
