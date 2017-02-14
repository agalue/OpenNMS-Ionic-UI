export class OnmsParameter {

    constructor(
        public name: string,
        public value: string,
        public type: string
    ) {}

    static importParameter(e: Object): OnmsParameter {
        if (!e) {
            return null;
        }
        let parameter = new OnmsParameter(
            e['name'],
            e['value'],
            e['type']
        );
        return parameter;
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