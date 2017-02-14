import { OnmsParameter } from './onms-parameter';
import { ONMS_SEVERITIES } from './onms-severities';

export class OnmsEvent {

    constructor(
        public id: number,
        public uei: string,
        public nodeId: number,
        public nodeLabel: string,
        public ipAddress: string,
        public serviceName: string,
        public eventTime: number,
        public createTime: number,
        public logMessage: string,
        public description: string,
        public severity: string,
        public host: string,
        public source: string,        
        public ifIndex: number,
        public parameters: OnmsParameter[] = []
    ) {}

    getSeverityIndex() {
        return ONMS_SEVERITIES.indexOf(this.severity);
    }

    static importEvent(e: Object): OnmsEvent {
        if (!e) {
            return null;
        }
        let event = new OnmsEvent(
            e['id'],
            e['uei'],
            e['nodeId'],
            e['nodeLabel'],
            e['ipAddress'],
            e['serviceType'] ? e['serviceType']['name'] : null,
            e['time'],
            e['createTime'],
            e['logMessage'],
            e['description'],
            OnmsEvent.capitalize(e['severity']),
            e['host'],
            e['source'],
            e['ifIndex'],
            OnmsParameter.importParameters(e['parameters'])
        );
        return event;
    }

    static importEvents(rawEvents: Object[]): OnmsEvent[] {
        let events: OnmsEvent[] = [];
        rawEvents.forEach(e => events.push(OnmsEvent.importEvent(e)));
        return events;
    }

    static capitalize(text: string = 'Indeterminate') : string {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

}