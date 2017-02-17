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

}