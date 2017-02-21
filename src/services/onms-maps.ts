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

  private mapOptions: Leaflet.MapOptions = {
    zoom: 1,
    maxZoom: 15,
    tap: true,
    touchZoom: true,
    doubleClickZoom: true,
    zoomControl: true,
    dragging: true,
    attributionControl: false
  };

  constructor(private http: HttpService) {}

  getGeolocations(request: GeolocationQuery) : Promise<GeolocationInfo[]> {
    return this.http.post('/api/v2/geolocation', 'application/json', request)
      .retry(this.retries)
      .map((response: Response) => GeolocationInfo.importLocations(response.json()))
      .toPromise()
  }

  createMap(mapId: string) : Leaflet.Map {
    let map = Leaflet.map(mapId, this.mapOptions);
    Leaflet.tileLayer(this.tileLayer).addTo(map);
    return map;
  }

  createMarkerGroup() : Leaflet.MarkerClusterGroup {
    return Leaflet.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      iconCreateFunction: (cluster: Leaflet.MarkerCluster) => {
        let severity = new SeverityInfo();
        let severityArray = [0, 0, 0, 0, 0, 0, 0];
        cluster.getAllChildMarkers().forEach(m => {
          let s = (<Object>m)['data'] as SeverityInfo;
          severityArray[s.id - 1]++;
          if (severity.id < s.id) {
            severity = s;
          }
        });
        let svg = this.createSvgElement(severityArray.slice(2, severityArray.length), cluster.getAllChildMarkers().length)
        return Leaflet.divIcon({
          iconSize: Leaflet.point(40, 40),
          className: `marker-cluster marker-cluster-${severity.label}`,
          html: `${svg}<div><span>${cluster.getChildCount()}</span></div>`
        }) as Leaflet.Icon;
      }
    });
  }

  resetMap(markersGroup: Leaflet.MarkerClusterGroup, locations: GeolocationInfo[]) {
    markersGroup.clearLayers();
    locations.forEach(location => {
      if (location.coordinates) {
        let icon = this.getIcon(location.severityInfo);
        let latlng = Leaflet.latLng(location.coordinates.latitude, location.coordinates.longitude);
        let marker = Leaflet.marker(latlng, { icon: icon });
        (<Object>marker)['data'] = location.severityInfo;
        markersGroup.addLayer(marker);
      }
    });
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

  private createSvgElement(dataArray: number[], total: number) : string {

    const cx = 20;
    const cy = 20;
    const r = 20;
    const innerR = 13;

    var startangle = 0;
    let classArray = ['Normal', 'Warning', 'Minor', 'Major', 'Critical'];
    var svg = '<svg class="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px">';

    for (let i = 0; i < dataArray.length; i++) {
      // Only consider severity if actually available
      if (dataArray[i] > 0) {
        var endangle = startangle + dataArray[i] / total * Math.PI * 2.0;

        // Calculate inner and outer circle
        var x1 = cx + (r * Math.sin(startangle));
        var y1 = cy - (r * Math.cos(startangle));
        var X1 = cx + (innerR * Math.sin(startangle));
        var Y1 = cy - (innerR * Math.cos(startangle));
        var x2 = cx + (r * Math.sin(endangle));
        var y2 = cy - (r * Math.cos(endangle));
        var X2 = cx + (innerR * Math.sin(endangle));
        var Y2 = cy - (innerR * Math.cos(endangle));
        var big = endangle - startangle > Math.PI ? 1 : 0;

        // this branch is if one data value comprises 100% of the data
        if (dataArray[i] >= total) {
          // path string
          let d = `M ${X1},${Y1} A ${innerR},${innerR} 0 1 0 ${X1},${(Y1 + (2 * innerR))} A ${innerR},${innerR} 0 ${big} 0 ${X1},${Y1} `
                + `M ${x1},${y1} A ${r},${r} 0 ${big} 1 ${x1},${(y1 + (2 * r))} A ${r},${r} 0 ${big} 1 ${x1},${y1}`;
          svg += `<path d="${d}" class="${classArray[i]}"/>`;
        } else {
          // path string
          let d = `M ${X1},${Y1} A ${innerR},${innerR} 0 ${big} 1 ${X2},${Y2} L ${x2},${y2} A ${r},${r} 0 ${big} 0 ${x1},${y1} Z`;
          svg += `<path d="${d}" class="${classArray[i]}"/>`;
        }
        startangle = endangle;
      }
    }
    svg += '</svg>';
    return svg;
  }

}