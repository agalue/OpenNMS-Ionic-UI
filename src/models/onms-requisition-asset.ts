import { OnmsAssetRecord } from './onms-asset-record';

export class OnmsRequisitionAsset {

    constructor(
        public name: string,
        public value: string
    ) {}

    static importAssets(rawAssets: Object[]) : OnmsRequisitionAsset[] {
        let assets: OnmsRequisitionAsset[] = [];
        rawAssets.forEach(i => assets.push(OnmsRequisitionAsset.importAsset(i)));
        return assets;
    }

    static importAsset(rawAsset: Object) : OnmsRequisitionAsset {
        return new OnmsRequisitionAsset(rawAsset['name'], rawAsset['value']);
    }

    static importAll(assetRecord: OnmsAssetRecord) : OnmsRequisitionAsset[] {
        let assets: OnmsRequisitionAsset[] = [];
        Object.keys(assetRecord).forEach(k => {
        if (assetRecord[k])
            assets.push(new OnmsRequisitionAsset(k, assetRecord[k]))
        });
        return assets;
    }

    static create() : OnmsRequisitionAsset {
        return new OnmsRequisitionAsset(null, null);
    }

    generateModel() : Object {
        let rawAsset: Object = {
            name: this.name,
            value: this.value
        };
        return rawAsset;
    }

}