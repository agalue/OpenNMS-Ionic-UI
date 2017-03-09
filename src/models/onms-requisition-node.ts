import { OnmsRequisitionInterface } from './onms-requisition-interface';
import { OnmsRequisitionCategory } from './onms-requisition-category';
import { OnmsRequisitionAsset } from './onms-requisition-asset';

export class OnmsRequisitionNode {

    public deployed: boolean = false;

    constructor(
        public foreignId: string,
        public nodeLabel: string,
        public location: string,
        public city: string,
        public building: string,
        public parentForeignSource: string,
        public parentForeignId: string,
        public parentNodeLabel: string,
        public interfaces: OnmsRequisitionInterface[] = [],
        public categories: OnmsRequisitionCategory[] = [],
        public assets: OnmsRequisitionAsset[] = []
    ) {}

    static importNodes(rawNodes: Object[]) : OnmsRequisitionNode[] {
        return rawNodes.map(n => OnmsRequisitionNode.importNode(n));
    }

    static importNode(rawNode: Object) : OnmsRequisitionNode {
        return new OnmsRequisitionNode(
            rawNode['foreign-id'],
            rawNode['node-label'],
            rawNode['location'],
            rawNode['city'],
            rawNode['building'],
            rawNode['parent-foreign-source'],
            rawNode['parent-foreign-id'],
            rawNode['parent-node-label'],
            OnmsRequisitionInterface.importInterfaces(rawNode['interface']),
            OnmsRequisitionCategory.importCategories(rawNode['category']),
            OnmsRequisitionAsset.importAssets(rawNode['asset'])
        );
    }

    static create(): OnmsRequisitionNode {
        return new OnmsRequisitionNode(null, null, null, null, null, null, null, null);
    }

    getPrimaryIP() : string {
        if (this.interfaces.length == 0) return null;
        const ip = this.interfaces.find(i => i.snmpPrimary == 'P');
        return ip ? ip.ipAddress + ' (P)' : this.interfaces[0].ipAddress
    }

    contains(keyword: string) : boolean {
        const k = keyword.toLowerCase();
        return this.nodeLabel.toLowerCase().includes(k)
            || this.interfaces.filter(ip => ip.ipAddress.toLowerCase().includes(k)).length > 0
            || this.categories.filter(c => c.name.toLowerCase().includes(k)).length > 0;
    }

    static assign(destination: OnmsRequisitionNode, source: OnmsRequisitionNode) {
      Object.assign(destination, source);
      destination.interfaces = source.interfaces.map(src => {
        let dst = OnmsRequisitionInterface.create();
        OnmsRequisitionInterface.assign(dst, src);
        return dst; 
      });
    }

    generateModel() : Object {
        return {
            'foreign-id': this.foreignId,
            'node-label': this.nodeLabel,
            'location': this.location,
            'city': this.city,
            'building': this.building,
            'parent-foreign-source': this.parentForeignSource,
            'parent-foreign-id': this.parentForeignId,
            'parent-node-label': this.parentNodeLabel,
            'asset': this.assets.map(a => a.generateModel()),
            'interface': this.interfaces.map(i => i.generateModel()),
            'category': this.categories.map(c => c.generateModel())
        };
    }

}