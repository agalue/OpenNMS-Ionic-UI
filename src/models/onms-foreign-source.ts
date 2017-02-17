import { OnmsRequisitionDetector } from './onms-requisition-detector';
import { OnmsRequisitionPolicy } from './onms-requisition-policy';

export class OnmsForeignSource {

    constructor(
        public name: string,
        public dateStamp: number,
        public scanInterval: number,
        public detectors: OnmsRequisitionDetector[] = [],
        public policies: OnmsRequisitionPolicy[] = []
    ) {}

    static importForeignSources(rawForeignSources: Object[]) : OnmsForeignSource[] {
        let foreignSources: OnmsForeignSource[] = [];
        rawForeignSources.forEach(fs => foreignSources.push(OnmsForeignSource.importForeignSource(fs)));
        return foreignSources;
    }

    static importForeignSource(rawForeignSource: Object) : OnmsForeignSource {
        return new OnmsForeignSource(
            rawForeignSource['name'],
            rawForeignSource['date-stamp'],
            rawForeignSource['scan-interval'],
            OnmsRequisitionDetector.importDetectors(rawForeignSource['detectors']),
            OnmsRequisitionPolicy.importPolicies(rawForeignSource['policies'])
        );
    }

    generateModel() : Object {
        let rawModel: Object = {
            'name': this.name,
            'date-stamp': this.dateStamp,
            'scan-interval': this.scanInterval,
            'detectors': [],
            'policies': []
        };
        this.detectors.forEach(d => rawModel['detectors'].push(d.generateModel()));
        this.policies.forEach(p => rawModel['policies'].push(p.generateModel()));
        return rawModel;
    }

}