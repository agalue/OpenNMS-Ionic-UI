import { OnmsSeverities } from './onms-severities';

export class OnmsAlarmStats {

  public acknowledgedCount: number;
  public unacknowledgedCount: number;
  public totalCount: number;
  public severity: string;

    static import(rawAlarm: Object): OnmsAlarmStats {
        if (!rawAlarm) return null;
        let alarm = Object.assign(new OnmsAlarmStats(), rawAlarm);
        alarm.severity = OnmsSeverities.capitalize(rawAlarm['severity']);
        return alarm;
    }

    static importAll(rawAlarms: Object[]): OnmsAlarmStats[] {
        let alarms: OnmsAlarmStats[] = [];
        rawAlarms.forEach(a => alarms.push(OnmsAlarmStats.import(a)));
        return alarms;
    }

}