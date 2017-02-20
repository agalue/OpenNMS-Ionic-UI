import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpService } from './http';

import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';
import 'rxjs/Rx';

export class GeolocationQuery {

  public includeAcknowledgedAlarms: boolean = false;
	public resolveMissingCoordinatesFromAddressString: boolean = false;
  public severityFilter: string = 'Normal';
  public strategy: string = 'Alarms'; // valid entries: 'Alarms', 'Outages'

}

export class NodeInfo {

  public nodeId: number;
  public nodeLabel: string;
  public foreignSource: string;
  public foreignId: string;
  public description: string;
  public maincontract: string;
  public ipAddress: string;
  public categories: string[] = [];

}

export class Coordinates {

  public latitude: number;
  public longitude: number;

}

export class SeverityInfo {

  public id: number = 0;
  public label: string = 'Normal';

}

export class AddressInfo {

  public address1: string;
  public address2: string;
  public city: string;
  public state: string;
  public zip: string;
  public country: string;

}

export class GeolocationInfo {

  public nodeInfo: NodeInfo;
  public coordinates: Coordinates;
  public severityInfo: SeverityInfo;
  public addressInfo: AddressInfo;
  public alarmUnackedCount: number;

  static importLocation(rawLocation: Object) : GeolocationInfo {
    let location = new GeolocationInfo();
    location.nodeInfo = Object.assign(new NodeInfo(), rawLocation['nodeInfo']);
    location.coordinates = Object.assign(new Coordinates(), rawLocation['coordinates']);
    location.severityInfo = Object.assign(new SeverityInfo(), rawLocation['severityInfo']);
    location.addressInfo = Object.assign(new AddressInfo(), rawLocation['addressInfo']);
    return location;
  }

  static importLocations(rawLocations: Object[]) : GeolocationInfo[] {
    let locations: GeolocationInfo[] = [];
    if (rawLocations) rawLocations.forEach(l => locations.push(GeolocationInfo.importLocation(l)));
    return locations;
  }

}

@Injectable()
export class OnmsMapsService {

  private retries: number = 3;

  constructor(private http: HttpService) {}

  getGeolocations(request: GeolocationQuery) : Promise<GeolocationInfo[]> {
    return this.http.post('/api/v2/geolocation', 'application/json', request)
      .retry(this.retries)
      .map((response: Response) => GeolocationInfo.importLocations(response.json()))
      .toPromise()
  }

}