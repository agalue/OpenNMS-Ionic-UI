import { OnmsEvent } from './onms-event';
import { OnmsParameter } from './onms-parameter';
import { ONMS_SEVERITIES } from './onms-severities';

export class OnmsAlarm {

    constructor(
        public id: number,
        public uei: string,
        public nodeId: number,
        public nodeLabel: string,
        public ipAddress: string,
        public serviceName: string,
        public lastEvent: OnmsEvent,
        public lastEventTime: number,
        public logMessage: string,
        public description: string,
        public type: number,
        public count: number,
        public reductionKey: string,
        public clearKey: string,
        public severity: string,
        public suppressedUntil: number,
        public suppressedTime: number,
        public ackId: number,
        public ifIndex: number,
        public parameters: OnmsParameter[] = []
    ) {}

    clear() {
        this.severity = 'Cleared';
    }

    escalate() {
        const current = this.getSeverityIndex();
        if (current < 7) {
            this.severity = ONMS_SEVERITIES[current + 1];
        }
    }

    getSeverityIndex() {
        return ONMS_SEVERITIES.indexOf(this.severity);
    }

    static importAlarm(e: Object): OnmsAlarm {
        if (!e) {
            return null;
        }
        let alarm = new OnmsAlarm(
            e['id'],
            e['uei'],
            e['nodeId'],
            e['nodeLabel'],
            e['ipAddress'],
            e['serviceType'] ? e['serviceType']['name'] : null,                
            OnmsEvent.importEvent(e['lastEvent']),
            e['lastEventTime'],
            e['logMessage'],
            e['description'],
            e['type'],
            e['count'],
            e['reductionKey'],
            e['clearKey'],
            OnmsEvent.capitalize(e['severity']),
            e['suppressedUntil'],
            e['suppressedTime'],
            e['ackId'],
            e['ifIndex']
        );
        if (e['parameters'] && e['parameters'].length > 0) {
            e['parameters'].forEach(p => {
                alarm.parameters.push(new OnmsParameter(p['name'], p['value'], p['type']));
            })
        }
        return alarm;
    }

    static importAlarms(rawAlarms: Object[]): OnmsAlarm[] {
        let alarms: OnmsAlarm[] = [];
        rawAlarms.forEach(a => alarms.push(OnmsAlarm.importAlarm(a)));
        return alarms;
    }

}