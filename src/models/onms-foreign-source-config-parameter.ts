export class OnmsForeignSourceConfigParameter {

    public key: string;
    public required: boolean;
    public options: string[] = [];

    static importParameters(rawParameters: Object[]) : OnmsForeignSourceConfigParameter[] {
        return rawParameters.map(p => OnmsForeignSourceConfigParameter.importParameter(p));
    }

    static importParameter(rawParameter: Object) : OnmsForeignSourceConfigParameter {
        return Object.assign(new OnmsForeignSourceConfigParameter(), rawParameter);
    }

}