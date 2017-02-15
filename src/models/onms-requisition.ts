import { OnmsRequisitionNode } from './onms-requisition-node';

export class OnmsRequisition {

    constructor(
        public foreignSource: string,
        public dateStamp: number,
        public lastImport: number,
        public nodes: OnmsRequisitionNode[] = []
    ) {}

    static importRequisitions(rawRequisitions: Object[]) : OnmsRequisition[] {
        let requisitions: OnmsRequisition[] = [];
        rawRequisitions.forEach(r => requisitions.push(OnmsRequisition.importRequisition(r)));
        return requisitions;
    }

    static importRequisition(rawRequisition: Object) : OnmsRequisition {
        let requisition = new OnmsRequisition(
            rawRequisition['foreign-source'],
            rawRequisition['date-stamp'],
            rawRequisition['last-import']
        );
        requisition.nodes = OnmsRequisitionNode.importNodes(rawRequisition['node']);
        return requisition;
    }

    getNode(foreignId: string) {
        return this.nodes.find(n => n.foreignId == foreignId);
    }

    updateNode(node: OnmsRequisitionNode) {
        const pos = this.nodes.findIndex(n => n.foreignId == node.foreignId);
        if (pos == -1) {
            this.nodes.push(node);
        } else {
            this.nodes[pos] = node;
        }
    }

    generateModel() : Object {
        let rawRequisition: Object = {
            'foreign-source': this.foreignSource,
            'date-stamp': this.dateStamp,
            'node': []
        };
        this.nodes.forEach(n => rawRequisition['node'].push(n.generateModel()));
        return rawRequisition;
    }

}