import { OnmsParameter } from './onms-parameter';
import { ONMS_SEVERITIES } from './onms-severities';

export class OnmsEvent {

    public id: number;
    public uei: string;
    public nodeId: number;
    public nodeLabel: string;
    public ipAddress: string;
    public serviceName: string;
    public time: number;
    public createTime: number;
    public logMessage: string;
    public description: string;
    public severity: string;
    public host: string;
    public source: string;
    public ifIndex: number;
    public parameters: OnmsParameter[] = [];

    static importEvent(rawEvent: Object): OnmsEvent {
        if (!rawEvent) return null;
        let event = Object.assign(new OnmsEvent(), rawEvent);
        event.serviceName = rawEvent['serviceType'] ? rawEvent['serviceType']['name'] : null;
        event.parameters = OnmsParameter.importParameters(rawEvent['parameters']);
        event.severity = OnmsEvent.capitalize(rawEvent['severity']);
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

    getSeverityIndex() {
        return ONMS_SEVERITIES.indexOf(this.severity);
    }

}