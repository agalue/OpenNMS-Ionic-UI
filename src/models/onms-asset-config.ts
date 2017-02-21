export class OnmsAssetFieldFormat {

  public label: string;
  public tooltip: string;
  public model: string;
  public type: string;

}

export class OnmsAssetConfig {

  public title: string;
  public fields: OnmsAssetFieldFormat[] = []

  static import(rawConfig: Object) : OnmsAssetConfig {
    return Object.assign(new OnmsAssetConfig(), rawConfig);
  }

  static importAll(rawConfig: Object[]) : OnmsAssetConfig[] {
    let configs: OnmsAssetConfig[] = [];
    rawConfig.forEach(c => configs.push(OnmsAssetConfig.import(c)));
    return configs;
  }

}