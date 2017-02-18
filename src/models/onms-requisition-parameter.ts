import { OnmsForeignSourceConfigParameter } from './onms-foreign-source-config-parameter';

export class OnmsRequisitionParameter {

    public key: string;
    public value: string;
    public required: boolean;
    public options: string[] = [];

    static importParameters(rawParameters: Object[]) : OnmsRequisitionParameter[] {
        let parameters: OnmsRequisitionParameter[] = [];
        rawParameters.forEach(p => parameters.push(OnmsRequisitionParameter.importParameter(p)));
        return parameters;
    }

    static importParameter(rawParameter: Object) : OnmsRequisitionParameter {
        return Object.assign(new OnmsRequisitionParameter(), rawParameter);
    }

    static create(source: OnmsForeignSourceConfigParameter) : OnmsRequisitionParameter {
        let p = new OnmsRequisitionParameter();
        p.key = source.key;
        p.value = null;
        p.update(source);
        return p;
    }

    update(source: OnmsForeignSourceConfigParameter) {
        this.required = source.required;
        this.options = source.options;
    }

    hasOptions() : boolean {
        return this.options.length > 0;
    }

    generateModel() : Object {
        let rawModel: Object = {
            'key': this.key,
            'value': this.value
        };
        return rawModel;
    }

}