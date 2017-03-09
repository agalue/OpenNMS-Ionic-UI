export class OnmsRequisitionStats {

    constructor(
        public foreignSource: string,
        public lastImported: string,
        public foreignIds: string[] = []
    ) {}

    static imporStats(rawStats: Object[]) : OnmsRequisitionStats[] {
        return rawStats.map(rs => OnmsRequisitionStats.importSingleStats(rs));
    }

    static importSingleStats(rawStats: Object) : OnmsRequisitionStats {
        return new OnmsRequisitionStats(
            rawStats['name'],
            rawStats['last-imported'],
            rawStats['foreign-id']
        );
    }

}