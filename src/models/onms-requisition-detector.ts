import { OnmsRequisitionParameter } from './onms-requisition-parameter';

export class OnmsRequisitionDetector {

    constructor(
        public name: string,
        public className: string,
        public parameters: OnmsRequisitionParameter[] = []
    ) {}

    static importDetectors(rawDetectors: Object[]) : OnmsRequisitionDetector[] {
        return rawDetectors.map(d => OnmsRequisitionDetector.importDetector(d));
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
        return {
            'name': this.name,
            'class': this.className,
            'parameter': this.parameters.map(p => p.generateModel())
        };
    }

}