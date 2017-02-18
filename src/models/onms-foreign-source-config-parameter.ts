export class OnmsForeignSourceConfigParameter {

    public key: string;
    public required: boolean;
    public options: string[] = [];

    static importParameters(rawParameters: Object[]) : OnmsForeignSourceConfigParameter[] {
        let parameters: OnmsForeignSourceConfigParameter[] = [];
        rawParameters.forEach(p => parameters.push(OnmsForeignSourceConfigParameter.importParameter(p)));
        return parameters;
    }

    static importParameter(rawParameter: Object) : OnmsForeignSourceConfigParameter {
        return Object.assign(new OnmsForeignSourceConfigParameter(), rawParameter);
    }

}