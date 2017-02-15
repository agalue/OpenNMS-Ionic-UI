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

}