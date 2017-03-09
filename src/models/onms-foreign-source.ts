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
        return rawForeignSources.map(fs => OnmsForeignSource.importForeignSource(fs));
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
        return {
            'name': this.name,
            'date-stamp': this.dateStamp,
            'scan-interval': this.scanInterval,
            'detectors': this.detectors.map(d => d.generateModel()),
            'policies': this.policies.map(p => p.generateModel())
        };
    }

}