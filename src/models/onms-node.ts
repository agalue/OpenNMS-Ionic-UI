import { OnmsAssetRecord } from './onms-asset-record';
import { OnmsIpInterface } from './onms-ip-interface';
import { OnmsSnmpInterface } from './onms-snmp-interface';
import { OnmsCategory } from './onms-category';

export class OnmsNode {

    public id: number;
    public label: string;
    public foreignSource: string;
    public foreignId: string;
    public sysName: string;
    public sysObjectId: string;
    public sysDescription: string;
    public sysLocation: string;
    public sysContact: string;
    public createTime: number;
    public labelSource: string;
    public assetRecord: OnmsAssetRecord;
    public categories: OnmsCategory[] = []
    public ipInterfaces: OnmsIpInterface[] = [];
    public snmpInterfaces: OnmsSnmpInterface[] = [];

    static importNode(rawNode: Object) : OnmsNode {
        let node : OnmsNode = Object.assign(new OnmsNode(), rawNode);
        node.assetRecord = Object.assign(new OnmsAssetRecord(), rawNode['assetRecord']);
        if (rawNode['categories'].length > 0) {
            node.categories = [];
            rawNode['categories'].forEach(c => node.categories.push(Object.assign(new OnmsCategory(), c)));
        }
        return node;
    }

    static importNodes(rawNodes: Object[]) : OnmsNode[] {
        let nodes: OnmsNode[] = [];
        rawNodes.forEach(n => nodes.push(OnmsNode.importNode(n)));
        return nodes;
    }

    hasLocation() : boolean {
        return this.assetRecord != null
            && this.assetRecord.latitude != null
            && this.assetRecord.longitude != null;
    }

    getLocation() : [number,number] {
        return this.assetRecord ? [ this.assetRecord.latitude, this.assetRecord.longitude ] : [-1, -1];
    }

    getPrimaryIP() : string {
        const ip = this.ipInterfaces.find(i => i.isPrimary());
        return ip ? ip.ipAddress : null;
    }

    getFirstIP() : string {
        const primary = this.getPrimaryIP();
        if (primary) return primary;
        return (this.ipInterfaces.length > 0 ? this.ipInterfaces[0].ipAddress : null);
    }

    isDown() : boolean {
        for (let intf of this.ipInterfaces) {
            if (!intf.isDown) return false;
        }
        return true;
    }

}