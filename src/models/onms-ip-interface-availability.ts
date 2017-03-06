import { OnmsServiceAvailability } from './onms-service-availability';

export class OnmsIpInterfaceAvailability {

    public id: number;
    public address: string;
    public availability: number;
    public services: OnmsServiceAvailability[] = [];

    static importInterface(rawInterface: Object): OnmsIpInterfaceAvailability {
        const intf = Object.assign(new OnmsIpInterfaceAvailability(), rawInterface);
        intf.services = OnmsServiceAvailability.importServices(intf['services']);
        return intf;
    }

    static importInterfaces(rawInterfaces: Object[]): OnmsIpInterfaceAvailability[] {
        let interfaces: OnmsIpInterfaceAvailability[] = [];
        rawInterfaces.forEach(i => interfaces.push(OnmsIpInterfaceAvailability.importInterface(i)));
        return interfaces;
    }

    contains(keyword: string) : boolean {
        const k = keyword.toLowerCase();
        return this.address.includes(k)
            || this.services.filter(s => s.name.toLowerCase().includes(k)).length > 0;
    }

}