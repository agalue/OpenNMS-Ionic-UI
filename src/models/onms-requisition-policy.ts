import { OnmsRequisitionParameter } from './onms-requisition-parameter';

export class OnmsRequisitionPolicy {

    constructor(
        public name: string,
        public className: string,
        public parameters: OnmsRequisitionParameter[] = []
    ) {}

    static importPolicies(rawPolicies: Object[]) : OnmsRequisitionPolicy[] {
        let policies: OnmsRequisitionPolicy[] = [];
        rawPolicies.forEach(p => policies.push(OnmsRequisitionPolicy.importPolicy(p)));
        return policies;
    }

    static importPolicy(rawPolicy: Object) : OnmsRequisitionPolicy {
        return new OnmsRequisitionPolicy(
            rawPolicy['name'],
            rawPolicy['class'],
            OnmsRequisitionParameter.importParameters(rawPolicy['parameter'])
        );
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