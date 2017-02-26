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

export class Metric {
  public name: string;
  public transient?: boolean;
  public attribute?: string;
  public resourceId?: string;
  public datasource?: string;
  public aggregation?: string;
  public expression?: string;
  public type?: string;
  public parameter?: string;
}

export class Value {
  public name: string;
  public expression: ConsolidatorFunction
}

export class Serie {
  public metric: string;
  public type: string;
}

export class PrintStatement {
  public metric?: string;
  public value?: number;
  public format: string;
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
  console.log(`Error: ${msg}`);
  throw `Error: ${msg}`;  
}