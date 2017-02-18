import { OnmsForeignSourceConfigParameter } from './onms-foreign-source-config-parameter';

export class OnmsForeignSourceConfig {

    constructor(
        public name: string,
        public className: string,
        public parameters: OnmsForeignSourceConfigParameter[] = []
    ) {}

    static importConfigs(rawConfigs: Object[]) : OnmsForeignSourceConfig[] {
        let configs: OnmsForeignSourceConfig[] = [];
        rawConfigs.forEach(c => configs.push(OnmsForeignSourceConfig.importConfig(c)));
        return configs;
    }

    static importConfig(rawDetector: Object) : OnmsForeignSourceConfig {
        return new OnmsForeignSourceConfig(
            rawDetector['name'],
            rawDetector['class'],
            OnmsForeignSourceConfigParameter.importParameters(rawDetector['parameters'])
        );
    }

}