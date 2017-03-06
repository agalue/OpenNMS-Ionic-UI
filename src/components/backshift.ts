import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { Http } from '@angular/http';

import { Server, PrefabGraph } from '../modules/ngx-backshift/models';
import { RrdGraphConverter } from '../modules/ngx-backshift/rrdgraph.converter';
import { OnmsDataSource } from '../modules/ngx-backshift/datasource.opennms';
import { GraphC3 } from '../modules/ngx-backshift/graph.c3';
import { OnmsServersService } from '../services/onms-servers';

import 'rxjs/Rx';

@Component({
  selector: 'backshift-graph',
  template: `
    <div #backshiftGraph></div>
  `
})
export class OnmsBackshiftComponent implements OnInit, OnChanges {

  @ViewChild('backshiftGraph') element:ElementRef;

  @Input('width') width: number;
  @Input('height') height: number;
  @Input('resourceId') resourceId: string;
  @Input('prefabGraph') prefabGraph: PrefabGraph;
  @Input('start') start: number;
  @Input('end') end: number;

  server: Server;

  constructor(
    private http: Http,
    private serversService: OnmsServersService
  ) {}

  ngOnInit() {
    this.serversService.getDefaultServer()
      .then(server => {
        this.server = server as Server;
        this.renderGraph();
      })
      .catch(error => console.error(error));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.server) this.renderGraph();
  }

  private renderGraph() {
    const targetElement = this.element.nativeElement;

    // Convert the graph definition to a supported model
    const rrdGraphConverter = new RrdGraphConverter(this.prefabGraph, this.resourceId);
    const graphModel = rrdGraphConverter.model;

    // Build the data-source
    const ds = new OnmsDataSource(this.http, this.server, graphModel.metrics);

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

    graph.render();
  }

}
