export class OnmsResourceAttribute {

  constructor(public name: string, public value: string) {}

}

export class OnmsResourcesByType {

  constructor(public resourceType: string,  public resources: OnmsResource[] = []) {}

}

export class OnmsResource {

  constructor(
    public id: string,
    public label: string,
    public name: string,
    public typeLabel: string,
    public stringPropertyAttributes: OnmsResourceAttribute[] = [],
    public externalValueAttributes: OnmsResourceAttribute[] = [],
    public rrdGraphAttributes: string[] = []
  ) {}

  static importResource(rawResource: Object) : OnmsResource {
    return new OnmsResource(
      rawResource['id'].replace('%3A',':'),
      rawResource['label'],
      rawResource['name'],
      rawResource['typeLabel'],
      Object.getOwnPropertyNames(rawResource['stringPropertyAttributes'])
        .map((key: string) => new OnmsResourceAttribute(key, rawResource['stringPropertyAttributes'][key])),
      Object.getOwnPropertyNames(rawResource['externalValueAttributes'])
        .map((key: string) => new OnmsResourceAttribute(key, rawResource['externalValueAttributes'][key])),
      Object.getOwnPropertyNames(rawResource['rrdGraphAttributes'])
      );
  }

  static importResources(rawResources: Object[]) : OnmsResource[] {
    return rawResources.map(r => OnmsResource.importResource(r));
  }

  static groupByResourceType(resources: OnmsResource[]) : OnmsResourcesByType[] {
    let map : OnmsResourcesByType[] = [];
    new Set(resources.map(r => r.typeLabel)).forEach(resourceType =>
      map.push(new OnmsResourcesByType(resourceType, resources.filter(r => r.typeLabel == resourceType)))
    );
    return map;
  }

}