import { Component, OnChanges, AfterViewInit, SimpleChanges, Input } from '@angular/core';
import * as C3 from 'c3';

@Component({
  selector: 'outages-summary',
  template: `
    <div id="outagesChart"></div>
  `
})
export class OutagesSummaryComponent implements AfterViewInit, OnChanges {

  @Input('outages') outages: { [service: string] : number };

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.renderChart();
  }

  private renderChart() {
    if (!this.outages) return;
    let columns = [];
    let total: number = 0;
    Object.keys(this.outages).forEach(service => {
      total += this.outages[service];
      columns.push([service, this.outages[service]])
    });
    C3.generate({
      bindto: '#outagesChart',
      data: {
        type: 'donut',
        columns: columns
      },
      donut: {
        title: `${total} ${total == 1 ? 'Outage' : 'Outages'}`
      },
    });
  }

}