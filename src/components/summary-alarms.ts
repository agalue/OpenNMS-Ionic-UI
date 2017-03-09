import { Component, OnChanges, AfterViewInit, SimpleChanges, Input } from '@angular/core';
import { OnmsSeverities } from '../models/onms-severities';
import { OnmsAlarmStats } from '../models/onms-alarm-stats';
import * as C3 from 'c3';

@Component({
  selector: 'alarms-summary',
  templateUrl: 'summary-alarms.html'
})
export class AlarmsSummaryComponent implements AfterViewInit, OnChanges {

  @Input('alarms') alarms: OnmsAlarmStats[];

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.renderChart();
  }

  private renderChart() {
    if (!this.alarms || this.alarms.length == 0) return;
    let columns = [];
    let total: number = 0;
    this.alarms.forEach(a => {
      if (a.totalCount > 0) {
        columns.push([a.severity, a.totalCount]);
        total += a.totalCount;
      }
    });
    C3.generate({
      bindto: '#alarmsChart',
      data: {
        type: 'donut',
        columns: columns,
        colors: OnmsSeverities.getColorMap()
      },
      donut: {
        title: `${total} ${total == 1 ? 'Alarm' : 'Alarms'}`
      },
    });
  }

}