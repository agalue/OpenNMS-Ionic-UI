import { OnmsRequisitionParameter } from './onms-requisition-parameter';

export class OnmsRequisitionPolicy {

    constructor(
        public name: string,
        public className: string,
        public parameters: OnmsRequisitionParameter[] = []
    ) {}

    static importPolicies(rawPolicies: Object[]) : OnmsRequisitionPolicy[] {
        return rawPolicies.map(p => OnmsRequisitionPolicy.importPolicy(p));
    }

    static importPolicy(rawPolicy: Object) : OnmsRequisitionPolicy {
        return new OnmsRequisitionPolicy(
            rawPolicy['name'],
            rawPolicy['class'],
            OnmsRequisitionParameter.importParameters(rawPolicy['parameter'])
        );
    }

    static create() : OnmsRequisitionPolicy {
        return new OnmsRequisitionPolicy(null, null);
    }

    generateModel() : Object {
        return {
            'name': this.name,
            'class': this.className,
            'parameter': this.parameters.map(p => p.generateModel())
        };
    }

}