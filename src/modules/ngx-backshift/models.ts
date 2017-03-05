export interface Server {
  url: string;
  username: string;
  password: string;
}

export class TimeSpan {
  public start: number;
  public end: number;
}

export class QueryResponse {
  public start: number;
  public end: number;
  public step: number;
  public timestamps: number[] = [];
  public labels: string[] = [];
  public columns: { values: number[] }[] = [];
  public constranints: { key: string, value: string }[] = [];
}

export class PrefabGraph {
  public name: string;
  public title: string;
  public columns: string[] = [];
  public command: string;
  public externalValues?: string[] = [];
  public propertiesValues?: string[] = [];
  public order: number;
  public types: string[] = [];
  public description?: string;
  public graphWidth?: number;
  public graphHeight?: number;
  public supress?: string[] = [];
  public width?: number;
  public height?: number;
}

export interface Metric {
  name: string;
  transient?: boolean;
  attribute?: string;
  resourceId?: string;
  datasource?: string;
  aggregation?: string;
  expression?: string;
  type?: string;
  parameter?: string;
}

export interface Value {
  name: string;
  expression: ConsolidatorFunction
}

export interface Serie {
  metric: string;
  type: string;
}

export interface PrintStatement {
  metric?: string;
  value?: number;
  format: string;
}

export class GraphModel {
  public title: string;
  public verticalLabel: string;
  public metrics: Metric[] = [];
  public values: Value[] = [];
  public series: Serie[] = [];
  public printStatements: PrintStatement[] = [];
  public properties: Object = {};
}

export interface GraphOptions {
  width: number,
  height: number,
  element: HTMLElement,
  start: number,
  end: number,
  dataSource: DataSource,
  model: GraphModel,
  step: boolean,
  title: string,
  verticalLabel: string,
  interactive: boolean,
  beginOnRender: boolean
}

export abstract class DataSource {

  metrics: Metric[] = [];

  constructor(metrics: Metric[]) {
    if (metrics === undefined || metrics.length === 0) {
      fail('DataSource needs one or more metrics.');
    }
    this.metrics = metrics;
  }

  abstract query(start: number, end: number, resolution: number) : Promise<any>;

}

export abstract class ConsolidatorFunction {

  constructor(
    public functionName: string,
    public metricName: string,
    public argument: number
  ) {}

  abstract handler(timestamps: number[], values: number[]) : [number, number];

  consolidate(data: any) : [number, number] {
    return this.handler(
      data.columns[data.columnNameToIndex['timestamp']],
      data.columns[data.columnNameToIndex[this.metricName]]
    );
  }

  forEach(timestamps: number[], values: number[], callback: (ts: number, val: number) => void) {
    var validCount = 0;
    for (var i = 0; i < timestamps.length; i++) {
      if (!this.valid(values[i])) {
        continue;
      }
      validCount++;
      callback(timestamps[i], values[i]);
    }
    return validCount;
  }

  valid(value) {
    return !isNaN(value) && isFinite(value);
  }

}

export function fail(msg: string) {
  console.error(`Error: ${msg}`);
  throw `Error: ${msg}`;  
}