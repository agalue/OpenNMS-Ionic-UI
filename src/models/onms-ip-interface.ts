import { OnmsSnmpInterface } from './onms-snmp-interface';

export class OnmsIpInterface {

    public id: number;
    public nodeId: number;
    public isDown: boolean;
    public ipAddress: string;
    public hostName: string;
    public ifIndex: number;
    public isManaged: string;
    public snmpPrimary: string;
    public lastCapsdPoll: number;
    public monitoredServiceCount: number;
    public snmpInterface: OnmsSnmpInterface;

    static importInterface(rawInterface: Object) : OnmsIpInterface {
        let intf : OnmsIpInterface = Object.assign(new OnmsIpInterface(), rawInterface);
        intf.snmpInterface = Object.assign(new OnmsSnmpInterface(), rawInterface['snmpInterface']);
        return intf;
    }

    static importInterfaces(rawInterfaces: Object[]) : OnmsIpInterface[] {
        let interfaces: OnmsIpInterface[] = [];
        rawInterfaces.forEach(i => interfaces.push(OnmsIpInterface.importInterface(i)));
        return interfaces;
    }

    isPrimary() : boolean {
        return this.snmpPrimary == 'P';
    }

    managed() : boolean {
        return this.isManaged == 'M';
    }

    contains(keyword: string ) : boolean {
        const k = keyword.toLowerCase();
        return this.ipAddress.includes(k)
            || this.hostName.toLowerCase().includes(k);
    }

}