export class OnmsSnmpInterface {

    public id: number;
    public ifType: string;
    public ifAlias: string;
    public ifIndex: number;
    public ifDescr: string;
    public ifName: string;
    public physAddr: string;
    public netMask: string;
    public ifSpeed: number;
    public ifAdminStatus: number;
    public ifOperStatus: number;
    public lastCapsdPoll: number;
    public lastSnmpPoll: number;
    public collectionUserSpecified: boolean;
    public collectFlag: string;
    public pollFlag: string;
    public collect: boolean;
    public poll: boolean;

    static importInterface(rawInterface: Object) : OnmsSnmpInterface {
        return Object.assign(new OnmsSnmpInterface(), rawInterface);
    }

    static importInterfaces(rawInterfaces: Object[]) : OnmsSnmpInterface[] {
        let interfaces: OnmsSnmpInterface[] = [];
        rawInterfaces.forEach(i => interfaces.push(OnmsSnmpInterface.importInterface(i)));
        return interfaces;
    }

    getOperStatus() : string {
        switch(this.ifOperStatus) {
            case 1: return 'Up';
            case 2: return 'Down';
            case 3: return 'Testing';
            case 4: return 'Unknown';
            case 5: return 'Dormant';
            case 6: return 'Not Present';
            case 7: return 'Lower Layer Down';
        }
        return 'N/A';
    }

    getAdminStatus() : string {
        switch(this.ifAdminStatus) {
            case 1: return 'Up';
            case 2: return 'Down';
            case 3: return 'Testing';
        }
        return 'N/A';
    }

}