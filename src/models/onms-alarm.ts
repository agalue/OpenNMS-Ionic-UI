import { OnmsEvent } from './onms-event';
import { OnmsAck } from './onms-ack';
import { OnmsAlarmMemo } from './alarm-memo';
import { OnmsParameter } from './onms-parameter';
import { OnmsSeverities } from './onms-severities';

export class OnmsAlarm {

    public id: number;
    public uei: string;
    public nodeId: number;
    public nodeLabel: string;
    public ipAddress: string;
    public serviceName: string;
    public lastEvent: OnmsEvent;
    public lastEventTime: number;
    public logMessage: string;
    public description: string;
    public type: number;
    public count: number;
    public reductionKey: string;
    public clearKey: string;
    public severity: string;
    public suppressedUntil: number;
    public suppressedTime: number;
    public ackTime: number;
    public ackUser: string;
    public ifIndex: number;
    public stickyMemo: OnmsAlarmMemo;
    public journalMemo: OnmsAlarmMemo;
    public parameters: OnmsParameter[] = [];

    static importAlarm(rawAlarm: Object): OnmsAlarm {
        if (!rawAlarm) return null;
        let alarm = Object.assign(new OnmsAlarm(), rawAlarm);
        alarm.lastEvent = OnmsEvent.importEvent(rawAlarm['lastEvent']);
        alarm.serviceName = rawAlarm['serviceType'] ? rawAlarm['serviceType']['name'] : null;
        alarm.parameters = OnmsParameter.importParameters(rawAlarm['parameters']);
        alarm.severity = OnmsSeverities.capitalize(rawAlarm['severity']);
        if (rawAlarm['stickyMemo']) alarm.stickyMemo = Object.assign(new OnmsAlarmMemo(), rawAlarm['stickyMemo']);
        if (rawAlarm['reductionKeyMemo']) alarm.journalMemo = Object.assign(new OnmsAlarmMemo(), rawAlarm['reductionKeyMemo']);
        return alarm;
    }

    static importAlarms(rawAlarms: Object[]): OnmsAlarm[] {
        let alarms: OnmsAlarm[] = [];
        rawAlarms.forEach(a => alarms.push(OnmsAlarm.importAlarm(a)));
        return alarms;
    }

    update(ack: OnmsAck) {
        if (ack.ackType != 'ALARM') {
            return;
        }
        switch (ack.ackAction) {
            case 'ACKNOWLEDGE':
                this.ackTime = ack.ackTime;
                this.ackUser = ack.ackUser;
                break;
            case 'UNACKNOWLEDGE':
                this.ackTime = null;
                this.ackUser = null;
                break;
            case 'CLEAR':
                this.severity = 'Cleared';
                break;
            case 'ESCALATE':
                const current = OnmsSeverities.getIndex(this.severity);
                if (current < 7) {
                    this.severity = OnmsSeverities.getSeverities()[current + 1];
                }
                break;
        }
    }

    isAcknowledged() : boolean {
        return this.ackTime != null;
    }

}