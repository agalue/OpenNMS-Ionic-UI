import { HttpModule, XHRBackend, ResponseOptions, Response } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { TestBed, inject } from "@angular/core/testing";
import { Storage } from '@ionic/storage';
import { StorageMock } from '../../test-config/mocks-ionic';

import { OnmsServersService, ONMS_SERVERS, OnmsFeatures } from './onms-servers';
import { OnmsServer, ONMS_MERIDIAN, ONMS_HORIZON } from '../models/onms-server';

describe('OnmsServersService', () => {
  let mockbackend: MockBackend, service: OnmsServersService, storage: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [
        OnmsServersService,
        { provide: Storage, useClass: StorageMock },
        { provide: XHRBackend, useClass: MockBackend }
      ]
    })
  });
    
  beforeEach(inject([OnmsServersService, XHRBackend, Storage], (_service, _mockbackend, _storage) => {
    service = _service;
    mockbackend = _mockbackend;
    storage = _storage;
  }));

  it('verify default server', () => {
    let response = {
      packageDescription: 'OpenNMS',
      displayVersion: '20.0.0',
      packageName: 'opennms',
      version: '20.0.0'
    };
    mockbackend.connections.subscribe(connection => {
      connection.mockRespond(new Response(new ResponseOptions({body: response})));
    });

    service.getDefaultServer()
      .then((server: OnmsServer) => {
        // Initially, it will be null
        expect(server).toBe(undefined);
        // Save a default server
        server = new OnmsServer('local', 'http://localhost:8980/opennms', 'admin', 'admin', true);
        service.saveServer(server)
          .then((updatedServer : OnmsServer) => {
            expect(server.type).toBe(ONMS_HORIZON);
            expect(server.version).toBe('20.0.0');
            // Validate default again
            service.getDefaultServer()
              .then((server: OnmsServer) => {
                expect(server.name).toBe('local');
                expect(service.supports(OnmsFeatures.RegionalStatus)).toBeTruthy();
              });
          });
      })
      .catch(() => fail());
  });

  it('remove non-default server', () => {
    storage.set(ONMS_SERVERS, [
        new OnmsServer('local1', 'http://localhost:8980/opennms', 'admin', 'admin', true),
        new OnmsServer('local2', 'http://localhost:8980/opennms', 'admin', 'admin', false)
    ]);

    service.removeServer(1)
      .then(() => {
        service.getServers().then(servers => expect(servers.length).toBe(1));
      })
      .catch(() => fail());
  });

  it('remove default server', () => {
    storage.set(ONMS_SERVERS, [
        new OnmsServer('local1', 'http://localhost:8980/opennms', 'admin', 'admin', true),
        new OnmsServer('local2', 'http://localhost:8980/opennms', 'admin', 'admin', false)
    ]);

    service.removeServer(0)
      .then(server => fail())
      .catch(reason => expect(reason).toBe('The default server cannot be deleted.'));
  });

  it('change default server', () => {
    storage.set(ONMS_SERVERS, [
        new OnmsServer('local1', 'http://localhost:8980/opennms', 'admin', 'admin', true),
        new OnmsServer('local2', 'http://localhost:8980/opennms', 'admin', 'admin', false)
    ]);

    service.setDefault(1)
      .then(server => expect(server.name).toBe('local2'));
  });

});