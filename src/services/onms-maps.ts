import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpService } from './http';

import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';
import 'rxjs/Rx';

import { OnmsNode } from '../models/onms-node';
import { OnmsAlarm } from '../models/onms-alarm';
import { OnmsSeverities } from '../models/onms-severities';

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

  static fromNode(node: OnmsNode) : NodeInfo {
    const nodeInfo = new NodeInfo();
    nodeInfo.nodeId = node.id;
    nodeInfo.nodeLabel = node.label;
    nodeInfo.foreignId = node.foreignId;
    nodeInfo.foreignSource = node.foreignSource;
    nodeInfo.ipAddress = node.getFirstIP(); // Not necessarily available initially
    nodeInfo.categories = node.categories.map(c => c.name);
    return nodeInfo;
  }

}

export class Coordinates {

  public latitude: number;
  public longitude: number;

  static fromNode(node: OnmsNode) : Coordinates {
    const coords = new Coordinates();
    const data = node.getLocation();
    coords.latitude = data[0];
    coords.longitude = data[1];
    return coords;
  }

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

  static fromNode(node: OnmsNode) : AddressInfo {
    const addressInfo = new AddressInfo();
    if (node.assetRecord) {
      addressInfo.address1 = node.assetRecord.address1;
      addressInfo.address2 = node.assetRecord.address2;
      addressInfo.city = node.assetRecord.city;
      addressInfo.state = node.assetRecord.state;
      addressInfo.zip = node.assetRecord.zip;
      addressInfo.country = node.assetRecord.country;
    }
    return addressInfo;
  }

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
    return rawLocations.map(l => GeolocationInfo.importLocation(l));
  }

  static import(node: OnmsNode, alarms: OnmsAlarm[]) : GeolocationInfo {
    let location = new GeolocationInfo();
    location.nodeInfo = NodeInfo.fromNode(node);
    location.coordinates = Coordinates.fromNode(node);
    location.addressInfo = AddressInfo.fromNode(node);
    location.severityInfo = new SeverityInfo();
    alarms.filter(a => a.nodeId == node.id).forEach(a => {
        if (!a.ackUser) location.alarmUnackedCount++;
        const severity = OnmsSeverities.getIndex(a.severity);
        if (severity > location.severityInfo.id) {
          location.severityInfo.id = severity;
          location.severityInfo.label = a.severity;
        }
    });
    return location;
  }

  contains(keyword: string) : boolean {
    const k = keyword.toLowerCase();
    return this.nodeInfo.nodeLabel.toLowerCase().includes(k)
        || (this.nodeInfo.ipAddress ? this.nodeInfo.ipAddress.toLowerCase().includes(k) : false)
        || (this.nodeInfo.foreignSource ? this.nodeInfo.foreignSource.toLowerCase().includes(k) : false)
        || (this.nodeInfo.categories.filter(c => c.toLowerCase().includes(k)).length > 0)
  }

}

export class SeverityLegendControl extends Leaflet.Control {

  constructor(options?: Leaflet.ControlOptions) {
    let forcedOptions: Leaflet.ControlOptions = { position: 'bottomleft' };
    super(forcedOptions);
  }

  onAdd(map: Leaflet.Map) : HTMLElement {
    let container = Leaflet.DomUtil.create('div', 'leaflet-control-attribution leaflet-control');
    ['Normal', 'Warning', 'Minor', 'Major', 'Critical'].forEach(severity => {
      container.innerHTML += `<div style="float:left;"><div style="float:left; margin-top: 3px; display:inline-block; height:10px; width: 10px;" class="marker-cluster-${severity}"></div><div style="float: left; margin-right: 4pt; margin-left: 2pt;">${severity}</div></div>`;
    })
    return container;
  }

  static addToMap(map: Leaflet.Map) {
    new SeverityLegendControl().addTo(map);
  }

}

@Injectable()
export class OnmsMapsService {

  private retries: number = 3;

  private tileLayer: string = 'https://tiles.opennms.org/{z}/{x}/{y}.png';

  constructor(private http: HttpService) {}

  getAlarmGeolocations(request: GeolocationQuery) : Promise<GeolocationInfo[]> {
    return this.http.post('/api/v2/geolocation', 'application/json', request)
      .retry(this.retries)
      .map((response: Response) => GeolocationInfo.importLocations(response.json()))
      .toPromise()
  }

  // NOTE: At this level, the IP interfaces for each node are unknown.
  //       It seems expensive to retrieve the primary interface for each node.
  getNodeGeolocations() : Promise<GeolocationInfo[]> {
    return new Promise<GeolocationInfo[]>((resolve, reject) => {
      const nodesPromise = this.http.get('/rest/nodes?limit=0')
        .map((response: Response) => OnmsNode.importNodes(response.json().node))
        .toPromise();
      const alarmsPromise = this.http.get('/rest/alarms?limit=0')
        .map((response: Response) => OnmsAlarm.importAlarms(response.json().alarm))
        .toPromise();
      Promise.all([nodesPromise, alarmsPromise])
        .then((results: any[]) => {
          let locations: GeolocationInfo[] = [];
          results[0].filter(n => n.hasLocation()).forEach(n => locations.push(GeolocationInfo.import(n, results[1])));
          resolve(locations);
        })
        .catch(error => reject(error))
    });
  }

  createMap(mapId: string, options: Leaflet.MapOptions) : Leaflet.Map {
    options.attributionControl = false;
    options.zoomControl = false;
    let map = Leaflet.map(mapId, options);
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
          let s = m['data'] as GeolocationInfo;
          severityArray[s.severityInfo.id - 1]++;
          if (severity.id < s.severityInfo.id) {
            severity = s.severityInfo;
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

  resetMap(markersGroup: Leaflet.MarkerClusterGroup, locations: GeolocationInfo[], onClickHandler?: Leaflet.EventHandlerFn) {
    markersGroup.clearLayers();
    locations.forEach(location => {
      if (location.coordinates) {
        let icon = this.getIcon(location.severityInfo);
        let latlng = Leaflet.latLng(location.coordinates.latitude, location.coordinates.longitude);
        let marker = Leaflet.marker(latlng, { icon: icon });
        marker['data'] = location;
        if (onClickHandler) marker.on('click', onClickHandler);
        markersGroup.addLayer(marker);
      }
    });
  }

  centerMap(map: Leaflet.Map, markersGroup: Leaflet.MarkerClusterGroup) {
    if (markersGroup.getBounds().isValid()) {
      map.fitBounds(markersGroup.getBounds(), {padding: [15, 15]});
    } else {
      map.setView([34.5133, -94.1629], 1); // center of earth
    }
  }

  private getIcon(severityInfo: SeverityInfo) : Leaflet.Icon {
    let severity = severityInfo && severityInfo.label ? severityInfo.label : 'Normal';
    return Leaflet.icon({
        iconUrl: `assets/images/severity${severity}.png`,
        iconRetinaUrl: `assets/images/${severity}@2x.png`,
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