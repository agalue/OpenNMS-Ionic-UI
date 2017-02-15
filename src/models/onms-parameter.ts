export class OnmsParameter {

    public name: string;
    public value: string;
    public type: string;

    static importParameter(rawParameter: Object): OnmsParameter {
        return Object.assign(new OnmsParameter(), rawParameter);
    }

    static importParameters(rawParameters: Object[]): OnmsParameter[] {
        if (!rawParameters || rawParameters.length == 0) {
            return [];
        }
        let parameters: OnmsParameter[] = [];
        rawParameters.forEach(p => parameters.push(OnmsParameter.importParameter(p)));
        return parameters;
    }

} 