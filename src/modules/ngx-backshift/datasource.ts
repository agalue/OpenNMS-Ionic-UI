import { Metric, fail } from './models';

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
