import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Http, Response } from '@angular/http';

import { OnmsServersService } from '../services/onms-servers';
import { HttpService } from '../services/http';

import { Server, PrefabGraph } from '../modules/ngx-backshift/models';
import { RrdGraphConverter } from '../modules/ngx-backshift/rrd-graph-converter';
import { OnmsDataSource } from '../modules/ngx-backshift/datasource-opennms';
import { GraphC3 } from '../modules/ngx-backshift/graph-c3';

import 'rxjs/Rx';

@Component({
  selector: 'backshift-graph',
  template: `
    <p>{{ graphTitle }}</p>
    <div #backshiftGraph></div>
  `
})
export class OnmsBackshiftComponent implements OnInit {

  @ViewChild('backshiftGraph') element:ElementRef;

  @Input('width') width: number;
  @Input('height') height: number;
  @Input('resourceId') resourceId: string;
  @Input('reportName') reportName: string;
  @Input('start') start: number;
  @Input('end') end: number;

  graphTitle: string;
  server: Server;

  constructor(
    private http: Http,
    private httpService: HttpService,
    private serversService: OnmsServersService
  ) {}

  ngOnInit() {
    this.serversService.getDefaultServer()
      .then(server => {
        this.server = server as Server;
        this.getPrefabGraph()
          .then(prefab => this.renderGraph(prefab))
          .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
  }

  private renderGraph(prefabGraph: PrefabGraph) {
    this.graphTitle = prefabGraph.title;
    const targetElement = this.element.nativeElement;
    console.log(prefabGraph);
    console.log(targetElement);

    // Convert the graph definition to a supported model
    const rrdGraphConverter = new RrdGraphConverter(prefabGraph, this.resourceId);
    const graphModel = rrdGraphConverter.model;
    console.log(graphModel);

    // Build the data-source
    const ds = new OnmsDataSource(this.http, this.server, graphModel.metrics);
    console.log(ds);

    // Build and render the graph
    const graph = new GraphC3({
        width: this.width,
        height: this.height,
        element: targetElement,
        start: this.start,
        end: this.end,
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

  getPrefabGraph() : Promise<PrefabGraph> {
    return this.httpService.get(`/rest/graphs/${this.reportName}`)
      .map((response: Response) => response.json() as PrefabGraph)
      .toPromise();
  }

}
