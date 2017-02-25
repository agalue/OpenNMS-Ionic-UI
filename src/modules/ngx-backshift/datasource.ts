import { Metric, fail } from './models';

export abstract class DataSource {

  metrics: Metric[] = [];

  constructor(args: any) {
    if (args.metrics === undefined || args.metrics.length === 0) {
      fail('DataSource needs one or more metrics.');
    }
    this.metrics = args.metrics;
  }

  abstract query(start: number, end: number, resolution: number, args?: any) : Promise<any>;

}
