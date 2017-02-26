import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Http } from '@angular/http';

import { PrefabGraph } from './models';
import { RrdGraphConverter } from './rrd-graph-converter';
import { OnmsDataSource } from './datasource-opennms';
import { GraphC3 } from './graph-c3';

@Component({
  selector: 'backshift-graph',
  template: `
    <div #backshiftGraph></div>
  `
})
export class BackshiftComponent implements OnInit {

  @ViewChild('backshiftGraph') element:ElementRef;
  @Input('width') width: number;
  @Input('height') height: number;

  constructor(private http: Http) {}

  ngOnInit() {
    const resourceId: string = 'node[71].interfaceSnmp[wireless_0-18cf5ebc49b9]';
    const prefabGraph: PrefabGraph = {
      name: 'mib2.traffic-inout',
      title: 'InOut Traffic',
      columns: ['ifInOctets', 'ifOutOctets'],
      command: "--title=\"In/Out Traffic Utilization\" --vertical-label=\"Percent utilization\" DEF:octIn={rrd1}:ifInOctets:AVERAGE DEF:octOut={rrd2}:ifOutOctets:AVERAGE CDEF:percentIn=octIn,8,*,{ifSpeed},/,100,* CDEF:percentOut=octOut,8,*,{ifSpeed},/,100,* CDEF:percentOutNeg=0,percentOut,- AREA:percentIn#73d216 LINE1:percentIn#4e9a06:\"In \" GPRINT:percentIn:AVERAGE:\"Avg \\: %8.2lf %s\" GPRINT:percentIn:MIN:\"Min \\: %8.2lf %s\" GPRINT:percentIn:MAX:\"Max \\: %8.2lf %s\\n\" AREA:percentOutNeg#729fcf LINE1:percentOutNeg#3465a4:\"Out\" GPRINT:percentOut:AVERAGE:\"Avg \\: %8.2lf %s\" GPRINT:percentOut:MIN:\"Min \\: %8.2lf %s\" GPRINT:percentOut:MAX:\"Max \\: %8.2lf %s\\n\"",
      propertiesValues: ['ifSpeed'],
      order: 1319669,
      types: ['interfaceSnmp']
    };

    const targetElement = this.element.nativeElement;
    const end = Date.now();
    const start = end - (12*60*60*1000); // (30*24*60*60*1000); // 30 days ago

    // Convert the graph definition to a supported model
    const rrdGraphConverter = new RrdGraphConverter(prefabGraph, resourceId);
    const graphModel = rrdGraphConverter.model;
    console.log(graphModel);

    // Build the data-source
    const ds = new OnmsDataSource(this.http, {
        url: 'https://demo.opennms.org/opennms',
        username: 'demo',
        password: 'demo',
        metrics: graphModel.metrics
    });
    console.log(ds);
    console.log(this.width);
    console.log(this.height)
    // Build and render the graph
    const graph = new GraphC3({
        width: this.width,
        height: this.height,
        element: targetElement,
        start: start,
        end: end,
        dataSource: ds,
        model: graphModel,
        step: false,
        title: graphModel.title,
        verticalLabel: graphModel.verticalLabel,
        interactive: false,
        beginOnRender: false
    });
    console.log(graph);

    graph.render();
    setTimeout(() => graph.begin(), 1000);
  }

}
