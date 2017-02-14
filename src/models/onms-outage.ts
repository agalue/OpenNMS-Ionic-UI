import { OnmsEvent } from './onms-event';

export class OnmsOutage {

    constructor(
        public id: number,
        public ifLostService: number,
        public ifRegainedService: number,
        public nodeId: number,
        public nodeLabel: string,
        public ipAddress: string,
        public serviceId: number,
        public serviceName: string,
        public serviceLostEvent: OnmsEvent,
        public serviceRegainedEvent: OnmsEvent
    ) {}

    static importOutage(e: Object): OnmsOutage {
        if (!e) {
            return null;
        }
        let outage = new OnmsOutage(
            e['id'],
            e['ifLostService'],
            e['ifRegainedService'],
            e['nodeId'],
            e['nodeLabel'],
            e['ipAddress'],
            e['serviceId'],
            e['monitoredService'] ? e['monitoredService']['serviceType']['name'] : null,
            OnmsEvent.importEvent(e['serviceLostEvent']),
            OnmsEvent.importEvent(e['serviceRegainedEvent'])
        );
        return outage;
    }

    static importOutages(rawOutages: Object[]): OnmsOutage[] {
        let outages: OnmsOutage[] = [];
        rawOutages.forEach(o => outages.push(OnmsOutage.importOutage(o)));
        return outages;
    }

}