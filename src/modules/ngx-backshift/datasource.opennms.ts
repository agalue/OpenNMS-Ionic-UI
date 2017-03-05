/*
 * Original JavaScript source:
 * https://github.com/OpenNMS/backshift/blob/master/src/Backshift.DataSource.OpenNMS.js
 */

import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { DataSource, Server, Metric } from './models';
import 'rxjs/Rx';

export class OnmsDataSource extends DataSource {

  private server: Server;
  private http: Http;

  constructor(http: Http, server: Server, metrics: Metric[]) {
    super(metrics);
    this.http = http;
    this.server = server;
  }

  query(start: number, end: number, resolution: number) : Promise<any> {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(this.server.username + ':' + this.server.password));
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });
    const data = this.getQueryRequest(start, end, resolution);
    return this.http.post(`${this.server.url}/rest/measurements`, JSON.stringify(data), options)
      .map((response:Response) => this.parseResponse(response.json()))
      .toPromise()
  }

  getQueryRequest(start, end, resolution) {
    var queryRequest = {
      "start": start,
      "end": end,
      "step": resolution > 0 ? Math.floor((end - start) / resolution) : 1,
      "source": [],
      "expression": [],
      "filter": []
    };

    var timeDeltaInSeconds = end - start;
    var qrSource;
    this.metrics.forEach(metric => {
      if (metric.resourceId !== undefined) {
        qrSource = {
          aggregation: metric.aggregation,
          attribute: metric.attribute,
          label: metric.name,
          resourceId: metric.resourceId,
          transient: metric.transient
        };
        // Only set the datasource when it differs from the attribute name in order
        // to preserve backwards compatibility with 16.x (which does not recognize the datasource field)
        if (metric.datasource !== undefined && metric.attribute !== metric.datasource) {
          qrSource.datasource = metric.datasource;
        }
        queryRequest.source.push(qrSource);
      } else if (metric.type === 'filter') {
        queryRequest.filter.push({
          name: metric.name,
          parameter: metric.parameter
        });
      } else {
        qrSource = {
          value: metric.expression,
          label: metric.name,
          transient: metric.transient
        };
        qrSource.value = qrSource.value.replace("__diff_time", timeDeltaInSeconds);
        queryRequest.expression.push(qrSource);
      }
    });

    if (queryRequest.source.length === 0) {
      delete queryRequest.source;
    }

    if (queryRequest.expression.length === 0) {
      delete queryRequest.expression;
    }

    if (queryRequest.filter.length === 0) {
      delete queryRequest.filter;
    }

    return queryRequest;
  }

  parseResponse(json) {
    var k, columns, columnNames, columnNameToIndex, constants, parts,
        numMetrics = json.labels.length;

    columns = new Array(1 + numMetrics);
    columnNames = new Array(1 + numMetrics);
    columnNameToIndex = {};

    columns[0] = json.timestamps;
    columnNames[0] = 'timestamp';
    columnNameToIndex['timestamp'] = 0;

    for (k = 0; k < numMetrics; k++) {
      columns[1 + k] = json.columns[k].values;
      columnNames[1 + k] = json.labels[k];
      columnNameToIndex[columnNames[1 + k]] = 1 + k;
    }

    if (json.constants) {
      let constants = {};
      for (var c=0, len=json.constants.length, key, value; c < len; c++) {
        key = json.constants[c].key;
        value = json.constants[c].value;

        // All of the constants are prefixed with the label of the associated source, but
        // the graph definitions don't support this prefix, so we just cut the prefix
        // off the constant name
        parts = key.split('.');
        if (parts.length > 1) {
          key = parts[1];
          constants[key] = (value === undefined? null: value);
        }
      }
    }

    return {
      columns: columns,
      columnNames: columnNames,
      columnNameToIndex: columnNameToIndex,
      constants: constants
    };
  }

}
