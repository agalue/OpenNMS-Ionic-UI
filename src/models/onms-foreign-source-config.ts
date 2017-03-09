import { OnmsForeignSourceConfigParameter } from './onms-foreign-source-config-parameter';

export class OnmsForeignSourceConfig {

    constructor(
        public name: string,
        public className: string,
        public parameters: OnmsForeignSourceConfigParameter[] = []
    ) {}

    static importConfigs(rawConfigs: Object[]) : OnmsForeignSourceConfig[] {
        return rawConfigs.map(c => OnmsForeignSourceConfig.importConfig(c));
    }

    static importConfig(rawDetector: Object) : OnmsForeignSourceConfig {
        return new OnmsForeignSourceConfig(
            rawDetector['name'],
            rawDetector['class'],
            OnmsForeignSourceConfigParameter.importParameters(rawDetector['parameters'])
        );
    }

}