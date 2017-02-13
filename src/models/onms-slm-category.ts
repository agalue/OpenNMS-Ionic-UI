export class OnmsSlmCategory {

    constructor(
        public name: string,
        public comment: string,
        public nodes: number[],
        public lastUpdated: number,
        public outageClass: string,
        public availabilityClass: string,
        public warningThreshold: number,
        public normalThreshold: number,
        public outageText: string,
        public availabilityText: string,
        public servicePercentage: number,
        public availability: number
    ) {}

    static import(rawCategory: Object) : OnmsSlmCategory {
        return new OnmsSlmCategory(
            rawCategory["name"],
            rawCategory['comment'],
            rawCategory['nodes'],
            rawCategory['last-updated'],
            rawCategory['outage-class'],
            rawCategory['availability-class'],
            rawCategory['warning-threshold'],
            rawCategory['normal-threshold'],
            rawCategory['outage-text'],
            rawCategory['availability-text'],
            rawCategory['service-percentage'],
            rawCategory['availability']
        );
    }

}