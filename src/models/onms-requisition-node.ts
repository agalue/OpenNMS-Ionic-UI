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
        let nodes: OnmsRequisitionNode[] = [];
        rawNodes.forEach(n => nodes.push(OnmsRequisitionNode.importNode(n)));
        return nodes;
    }

    static importNode(rawNode: Object) : OnmsRequisitionNode {
        let node = new OnmsRequisitionNode(
            rawNode['foreign-id'],
            rawNode['node-label'],
            rawNode['location'],
            rawNode['city'],
            rawNode['building'],
            rawNode['parent-foreign-source'],
            rawNode['parent-foreign-id'],
            rawNode['parent-node-label']
        );
        node.interfaces = OnmsRequisitionInterface.importInterfaces(rawNode['interface']);
        node.categories = OnmsRequisitionCategory.importCategories(rawNode['category']);
        node.assets = OnmsRequisitionAsset.importAssets(rawNode['asset']);
        return node;
    }

    static create(): OnmsRequisitionNode {
        return new OnmsRequisitionNode(null, null, null, null, null, null, null, null);
    }

    getPrimaryIP() : string {
        if (this.interfaces.length == 0) return null;
        const ip = this.interfaces.find(i => i.snmpPrimary == 'P');
        return ip ? ip.ipAddress + ' (P)' : this.interfaces[0].ipAddress
    }

    generateModel() : Object {
        let rawNode: Object = {
            'foreign-id': this.foreignId,
            'node-label': this.nodeLabel,
            'location': this.location,
            'city': this.city,
            'building': this.building,
            'parent-foreign-source': this.parentForeignSource,
            'parent-foreign-id': this.parentForeignId,
            'parent-node-label': this.parentNodeLabel,
            'asset': [],
            'interface': [],
            'category': []
        };
        this.assets.forEach(a => rawNode['asset'].push(a.generateModel()));
        this.interfaces.forEach(i => rawNode['interface'].push(i.generateModel()));
        this.categories.forEach(c => rawNode['category'].push(c.generateModel()));
        return rawNode;
    }

}