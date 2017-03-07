import { Component, Input } from '@angular/core';
import { OnmsSeverities } from '../models/onms-severities';
import { OnmsAlarmStats } from '../models/onms-alarm-stats';
import * as C3 from 'c3';

@Component({
  selector: 'alarms-summary',
  template: `
    <div id="alarmsChart"></div>
    <br>
    <ion-grid>
      <ion-row>
        <ion-col><b>Severity</b></ion-col>
        <ion-col width-20 text-right><b>Total</b></ion-col>
        <ion-col width-20 text-right><b># Ack</b></ion-col>
        <ion-col width-20 text-right><b># Unack</b></ion-col>
      </ion-row>
      <ion-row *ngFor="let alarm of alarms">
        <ion-col [class]="alarm.severity">{{ alarm.severity }}</ion-col>
        <ion-col width-20 text-right>{{ alarm.totalCount }}</ion-col>
        <ion-col width-20 text-right>{{ alarm.acknowledgedCount }}</ion-col>
        <ion-col width-20 text-right>{{ alarm.unacknowledgedCount }}</ion-col>
      </ion-row>
    </ion-grid>  
  `
})
export class AlarmsSummaryComponent {

    @Input('alarms') alarms: OnmsAlarmStats[];

    ngAfterViewInit() {
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