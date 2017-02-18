import { OnmsRequisitionParameter } from './onms-requisition-parameter';

export class OnmsRequisitionDetector {

    constructor(
        public name: string,
        public className: string,
        public parameters: OnmsRequisitionParameter[] = []
    ) {}

    static importDetectors(rawDetectors: Object[]) : OnmsRequisitionDetector[] {
        let detectors: OnmsRequisitionDetector[] = [];
        rawDetectors.forEach(d => detectors.push(OnmsRequisitionDetector.importDetector(d)));
        return detectors;
    }

    static importDetector(rawDetector: Object) : OnmsRequisitionDetector {
        return new OnmsRequisitionDetector(
            rawDetector['name'],
            rawDetector['class'],
            OnmsRequisitionParameter.importParameters(rawDetector['parameter'])
        );
    }

    static create() : OnmsRequisitionDetector {
        return new OnmsRequisitionDetector(null, null);
    }

    generateModel() : Object {
        let rawModel: Object = {
            'name': this.name,
            'class': this.className,
            'parameter': []
        };
        this.parameters.forEach(p => rawModel['parameter'].push(p.generateModel()));
        return rawModel;
    }

}