import { OnmsEvent } from './onms-event';

export class OnmsOutage {

    public id: number;
    public ifLostService: number;
    public ifRegainedService: number;
    public nodeId: number;
    public nodeLabel: string;
    public foreignSource: string;
    public foreignId: string;
    public ipAddress: string;
    public serviceId: number;
    public serviceName: string;
    public serviceLostEvent: OnmsEvent;
    public serviceRegainedEvent: OnmsEvent;

    static importOutage(rawOutage: Object): OnmsOutage {
        if (!rawOutage) return null;
        let outage = Object.assign(new OnmsOutage(), rawOutage);
        outage.serviceName = rawOutage['monitoredService'] ? rawOutage['monitoredService']['serviceType']['name'] : null;
        outage.serviceLostEvent = OnmsEvent.importEvent(rawOutage['serviceLostEvent']);
        outage.serviceRegainedEvent = OnmsEvent.importEvent(rawOutage['serviceRegainedEvent']);
        return outage;
    }

    static importOutages(rawOutages: Object[]): OnmsOutage[] {
        return rawOutages.map(o => OnmsOutage.importOutage(o));
    }

    getSeverity() {
        return this.serviceRegainedEvent ? 'Normal' : 'Major';
    }

}