export class OnmsRequisitionStats {

    constructor(
        public foreignSource: string,
        public lastImported: string,
        public foreignIds: string[] = []
    ) {}

    static imporStats(rawStats: Object[]) : OnmsRequisitionStats[] {
        let stats: OnmsRequisitionStats[] = [];
        rawStats.forEach(r => stats.push(OnmsRequisitionStats.importSingleStats(r)));
        return stats;
    }

    static importSingleStats(rawStats: Object) : OnmsRequisitionStats {
        let stats = new OnmsRequisitionStats(
            rawStats['name'],
            rawStats['last-imported'],
            rawStats['foreign-id']
        );
        return stats;
    }

}