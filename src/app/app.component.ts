import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';
import { EventsPage } from '../pages/events/events';
import { AlarmsPage } from '../pages/alarms/alarms';
import { OutagesPage } from '../pages/outages/outages';
import { NotificationsPage } from '../pages/notifications/notifications';
import { NodesPage } from '../pages/nodes/nodes';
import { SnmpConfigPage } from '../pages/snmp-config/snmp-config';
import { RequisitionsPage } from '../pages/requisitions/requisitions';
import { ServersPage } from '../pages/servers/servers';
import { SetupPage } from '../pages/setup/setup';

import { OnmsServersService } from '../services/onms-servers';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, private serversConfig: OnmsServersService) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Events', component: EventsPage },
      { title: 'Alarms', component: AlarmsPage },
      { title: 'Outages', component: OutagesPage },
      { title: 'Notifications', component: NotificationsPage },
      { title: 'Nodes', component: NodesPage },
      { title: 'SNMP Config', component: SnmpConfigPage },
      { title: 'Requisitions', component: RequisitionsPage },
      { title: 'Servers', component: ServersPage }
    ];

    serversConfig.getDefaultServer()
      .then(defaultServer => this.rootPage = defaultServer ? HomePage : SetupPage )
      .catch(error => console.log(error));
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
