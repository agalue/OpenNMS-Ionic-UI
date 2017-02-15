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
        let snmp = Object.assign(new OnmsSnmpInterface(), rawInterface['snmpInterface']);
        let intf = Object.assign(new OnmsIpInterface(), rawInterface);
        if (snmp) intf.snmpInterface = snmp;
        return intf;
    }

    static importInterfaces(rawInterfaces: Object[]) : OnmsIpInterface[] {
        let interfaces: OnmsIpInterface[] = [];
        rawInterfaces.forEach(i => interfaces.push(OnmsIpInterface.importInterface(i)));
        return interfaces;
    }

}