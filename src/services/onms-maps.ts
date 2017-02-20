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
  private tileLayer: string = 'https://tiles.opennms.org/{z}/{x}/{y}.png';
  private tileAttribution: string = "Map data &copy; <b>OpenStreetMap</b> contributors under <i>ODbL</i>, <i>CC BY-SA 2.0</i>"
  private map: Leaflet.Map;
  private markersGroup: Leaflet.MarkerClusterGroup;

  private mapOptions: Leaflet.MapOptions = {
    zoom: 1,
    maxZoom: 15
  };

  constructor(private http: HttpService) {}

  createMap(mapId: string, request: GeolocationQuery) : Promise<Leaflet.Map> {
    return new Promise<Leaflet.Map>((resolve, reject) => {
      this.initMap(mapId);
      this.loadGeolocations(request).then(() => {
        this.centerOnMap();
        resolve(this.map);
      });
    });
  }

  private initMap(mapId: string) {
    if (this.map) return;
    this.map = Leaflet.map(mapId, this.mapOptions);
    Leaflet.tileLayer(this.tileLayer, { attribution: this.tileAttribution }).addTo(this.map);
    this.initMarkerGroup();
  }

  private initMarkerGroup() {
    this.markersGroup = Leaflet.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      iconCreateFunction: (cluster: Leaflet.MarkerCluster) => {
        let severity = new SeverityInfo();
        cluster.getAllChildMarkers().forEach(m => {
          let s = (<Object>m)['data'] as SeverityInfo;
          if (severity.id < s.id) {
            severity = s;
          }
        });
        return Leaflet.divIcon({
          iconSize: Leaflet.point(30, 30),
          className: `myCluster ${severity.label}_`,
          html: cluster.getChildCount().toString()
        }) as Leaflet.Icon;
      }
    }).addTo(this.map);
  }

  private resetMap(locations: GeolocationInfo[]) {
    this.markersGroup.clearLayers();
    locations.forEach(location => {
      if (location.coordinates) {
        let icon = this.getIcon(location.severityInfo);
        let latlng = Leaflet.latLng(location.coordinates.latitude, location.coordinates.longitude);
        let marker = Leaflet.marker(latlng, { icon: icon });
        (<Object>marker)['data'] = location.severityInfo;
        this.markersGroup.addLayer(marker);
      }
    });
  }

  private loadGeolocations(request: GeolocationQuery) : Promise<any> {
    return this.http.post('/api/v2/geolocation', 'application/json', request)
      .retry(this.retries)
      .map((response: Response) => GeolocationInfo.importLocations(response.json()))
      .toPromise()
      .then(locations => this.resetMap(locations))
  }

  private centerOnMap() {
    if (this.markersGroup.getBounds().isValid()) {
      this.map.fitBounds(this.markersGroup.getBounds(), {padding: [15, 15]});
    } else {
      this.map.setView([34.5133, -94.1629], 1); // center of earth
    }
  }

  private getIcon(severityInfo: SeverityInfo) : Leaflet.Icon {
    let severity = severityInfo && severityInfo.label ? severityInfo.label : 'Normal';
    return Leaflet.icon({
        iconUrl: `/assets/images/severity${severity}.png`,
        iconRetinaUrl: `/assets/images/${severity}@2x.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
  }

}