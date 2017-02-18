export class OnmsRequisitionAsset {

    public name: string;
    public value: string;

    static importAssets(rawAssets: Object[]) : OnmsRequisitionAsset[] {
        let assets: OnmsRequisitionAsset[] = [];
        rawAssets.forEach(i => assets.push(OnmsRequisitionAsset.importAsset(i)));
        return assets;
    }

    static importAsset(rawAsset: Object) : OnmsRequisitionAsset {
        return Object.assign(new OnmsRequisitionAsset(), rawAsset);
    }

    generateModel() : Object {
        let rawAsset: Object = {
            name: this.name,
            value: this.value
        };
        return rawAsset;
    }

}