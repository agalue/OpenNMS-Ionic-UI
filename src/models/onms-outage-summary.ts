export class OnmsOutageSummary {

    constructor(
        public nodeId: number,
        public nodeLabel: string,
        public timeDown: number,
        public timeUp: number,
        public timeNow: number
    ) {}

    static importSummary(e: Object): OnmsOutageSummary {
        if (!e) return null;
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
        return rawOutages.map(o => OnmsOutageSummary.importSummary(o));
    }

    getTimeInfo(): string {
        const difference =  Math.round(Math.abs(this.timeNow - this.timeDown)/1000);
        const days = difference / 86400;
        if (days < 1) {
            const hours = difference / 3600;
            if (hours < 1) {
                const minutes = difference / 60;
                if (minutes < 1) {
                    return this.formatNumber(difference, 'second');
                } else {
                    return this.formatNumber(minutes, 'minute');
                }
            } else {
                return this.formatNumber(hours, 'hour');
            }
        } else if (days >= 365.0) {
            return this.formatNumber((days / 365.0), 'year');
        } else if (days >= 30.0) {
            return this.formatNumber((days / 30.0), 'month');
        } else if (days >= 7.0) {
            return this.formatNumber((days / 7.0), 'week');
        } else if (days >= 1.0) {
            return this.formatNumber(days, 'day');
        }
    }

    private formatNumber(n: number, units: string) : string {
        const num = Math.round(n);
        return `${num} ${units}${num > 1 ? 's':''}`;
    }

}