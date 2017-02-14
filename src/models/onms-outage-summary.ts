export class OnmsOutageSummary {

    constructor(
        public nodeId: number,
        public nodeLabel: string,
        public timeDown: number,
        public timeUp: number,
        public timeNow: number
    ) {}

    static importSummary(e: Object): OnmsOutageSummary {
        if (!e) {
            return null;
        }
        let outage = new OnmsOutageSummary(
            e['node-id'],
            e['node-label'],
            e['time-down'],
            e['time-up'],
            e['time-now']
        );
        return outage;
    }

    static importSumaries(rawOutages: Object[]): OnmsOutageSummary[] {
        let outages: OnmsOutageSummary[] = [];
        rawOutages.forEach(o => outages.push(OnmsOutageSummary.importSummary(o)));
        return outages;
    }

}