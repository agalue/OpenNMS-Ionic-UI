export class OnmsRequisitionParameter {

    public key: string;
    public value: string;

    static importParameters(rawParameters: Object[]) : OnmsRequisitionParameter[] {
        let parameters: OnmsRequisitionParameter[] = [];
        rawParameters.forEach(p => parameters.push(OnmsRequisitionParameter.importParameter(p)));
        return parameters;
    }

    static importParameter(rawParameter: Object) : OnmsRequisitionParameter {
        return Object.assign(new OnmsRequisitionParameter(), rawParameter);
    }

    generateModel() : Object {
        let rawModel: Object = {
            'key': this.key,
            'value': this.value
        };
        return rawModel;
    }

}