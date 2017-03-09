export class OnmsParameter {

    public name: string;
    public value: string;
    public type: string;

    static importParameter(rawParameter: Object): OnmsParameter {
        return Object.assign(new OnmsParameter(), rawParameter);
    }

    static importParameters(rawParameters: Object[]): OnmsParameter[] {
        if (!rawParameters || rawParameters.length == 0) return [];
        return rawParameters.map(p => OnmsParameter.importParameter(p));
    }

} 