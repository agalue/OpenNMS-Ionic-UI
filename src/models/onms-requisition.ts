import { OnmsRequisitionNode } from './onms-requisition-node';
import { OnmsRequisitionStats } from './onms-requisition-stats';

export class OnmsRequisition {

    public deployed: boolean = false;
    public deployedNodes: number = 0;

    constructor(
        public foreignSource: string,
        public dateStamp: number,
        public lastImport: number,
        public nodes: OnmsRequisitionNode[] = []
    ) {}

    static create(foreignSource: string): OnmsRequisition {
        return new OnmsRequisition(foreignSource, new Date().getTime(), null);
    }

    static importRequisitions(rawRequisitions: Object[]) : OnmsRequisition[] {
        return rawRequisitions.map(r => OnmsRequisition.importRequisition(r));
    }

    static importRequisition(rawRequisition: Object) : OnmsRequisition {
        return new OnmsRequisition(
            rawRequisition['foreign-source'],
            rawRequisition['date-stamp'],
            rawRequisition['last-import'],
            OnmsRequisitionNode.importNodes(rawRequisition['node'])
        );
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

    removeNode(node: OnmsRequisitionNode) {
        const pos = this.nodes.findIndex(n => n.foreignId == node.foreignId);
        if (pos == -1) {
            this.nodes.slice(pos, 1);
        }
    }

    markAsDeployed() {
        this.deployed = true;
        this.deployedNodes = this.nodes.length;
        this.nodes.forEach(n => n.deployed = true);
    }

    update(stats: OnmsRequisitionStats) {
        this.deployed = true;
        this.deployedNodes = 0;
        this.nodes.forEach(n => {
            if (stats.foreignIds.indexOf(n.foreignId) > -1) {
                n.deployed = true;
                this.deployedNodes++;
            }
        });
    }

    contains(keyword: string) : boolean {
        const k = keyword.toLowerCase();
        return this.foreignSource.toLowerCase().includes(k)
            || this.nodes.filter(n => n.contains(k)).length > 0;
    }

    generateModel() : Object {
        return {
            'foreign-source': this.foreignSource,
            'date-stamp': this.dateStamp,
            'node': this.nodes.map(n => n.generateModel())
        };
    }

}