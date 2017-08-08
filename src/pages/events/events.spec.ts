import { async, inject, TestBed } from '@angular/core/testing';
import { IonicModule, NavController, LoadingController, AlertController } from 'ionic-angular';

import { HttpModule, XHRBackend, ResponseOptions, Response } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Storage } from '@ionic/storage';
import { StorageMock, ViewControllerMock } from '../../../test-config/mocks-ionic';

import { OnmsTitleComponent } from '../../components/title';
import { EventsPage } from './events';

import { HttpService } from "../../services/http";
import { OnmsServersService, ONMS_SERVERS } from '../../services/onms-servers';
import { OnmsServer } from '../../models/onms-server';
import { OnmsUIService } from "../../services/onms-ui";
import { OnmsEventsService } from "../../services/onms-events";

const sampleEvents = {
  "count": 2,
  "totalCount": 61065,
  "offset": null,
  "event": [{
    "id": 1606933,
    "ifIndex": null,
    "nodeId": 14,
    "nodeLabel": "marvin.internal.opennms.com",
    "serviceType": {
      "id": 29,
      "name": "Update"
    },
    "ipAddress": "172.20.1.17",
    "host": "mephesto.internal.opennms.com",
    "uei": "uei.opennms.org/nodes/nodeLostService",
    "time": 1420071955000,
    "source": "OpenNMS.Poller.DefaultPollContext",
    "createTime": 1420071955714,
    "description": "A Update outage was identified on interface 172.20.1.17.",
    "logMessage": "Update outage identified on interface 172.20.1.17 with reason code: SNMP poll failed",
    "log": "Y",
    "display": "Y",
    "severity": "MINOR",
    "parameters": [{
      "name": "eventReason",
      "value": "SNMP poll failed, addr%61172.20.1.17 oid%61.1.3.6.1.4.1.8072.1.3.2.4.1.2.6.117.112.100.97.116.101.1",
      "type": "string"
    }]
  }, {
    "id": 1606934,
    "ifIndex": null,
    "nodeId": 14,
    "nodeLabel": "marvin.internal.opennms.com",
    "serviceType": {
      "id": 29,
      "name": "Update"
    },
    "ipAddress": "172.20.1.17",
    "host": "mephesto.internal.opennms.com",
    "uei": "uei.opennms.org/nodes/nodeRegainedService",
    "time": 1420071985000,
    "source": "OpenNMS.Poller.DefaultPollContext",
    "createTime": 1420071985763,
    "description": "he Update service on interface 172.20.1.17 was previously down and has been restored.",
    "logMessage": "The Update outage on interface 172.20.1.17 has been cleared. Service is restored.",
    "log": "Y",
    "display": "Y",
    "severity": "NORMAL"
  }]
};

describe('EventsPage', () => {
  let mockbackend: MockBackend;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        OnmsTitleComponent,
        EventsPage
      ],
      imports: [
        IonicModule.forRoot(EventsPage),
        HttpModule
      ],
      providers: [
        NavController,
        HttpService,
        OnmsServersService,
        OnmsEventsService,
        OnmsUIService,
        { provide: Storage, useClass: StorageMock },
        { provide: XHRBackend, useClass: MockBackend },
        { provide: LoadingController, useClass: ViewControllerMock },
        { provide: AlertController, useClass: ViewControllerMock }
      ]
    });
  }));

  beforeEach(inject([XHRBackend, Storage, OnmsServersService, HttpService], (_mockbackend, _storage, _servers, _http) => {
    mockbackend = _mockbackend;
    let server = new OnmsServer('local', 'http://localhost:8980/opennms', 'admin', 'admin', true);
    _storage.set(ONMS_SERVERS, [server]);
    _servers.getDefaultServer();
    _http.defaultServer = server;
  }));

  it('should display events', async(() => {
    mockbackend.connections.subscribe(connection => {
      connection.mockRespond(new Response(new ResponseOptions({body: sampleEvents})));
    });

    let fixture = TestBed.createComponent(EventsPage);
    let page = fixture.componentInstance;
    page.ionViewWillLoad();

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(page.noEvents).toBeFalsy();
      expect(page.events.length).toBe(2);
    });
  }));

});