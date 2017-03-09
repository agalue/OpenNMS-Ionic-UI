import { OnmsRequisitionService } from './onms-requisition-service';

export class OnmsRequisitionInterface {

    constructor(
        public ipAddress: string,
        public snmpPrimary: string,
        public description: string,
        public services: OnmsRequisitionService[] = []
    ) {}

    static create() : OnmsRequisitionInterface {
        return new OnmsRequisitionInterface(null, null, null);
    }

    static importInterfaces(rawInterfaces: Object[]) : OnmsRequisitionInterface[] {
        return rawInterfaces.map(i => OnmsRequisitionInterface.importInterface(i));
    }

    static importInterface(rawInterface: Object) : OnmsRequisitionInterface {
        let intf = new OnmsRequisitionInterface(
            rawInterface['ip-addr'],
            rawInterface['snmp-primary'],
            rawInterface['descr']
        );
        intf.services = OnmsRequisitionService.importServices(rawInterface['monitored-service']);
        return intf;
    }

    static assign(destination: OnmsRequisitionInterface, source: OnmsRequisitionInterface) {
        Object.assign(destination, source);
        if (source.services) {
            destination.services = source.services.map(s => new OnmsRequisitionService(s.name));
        }
    }

    generateModel() : Object {
        return {
            'ip-addr': this.ipAddress,
            'snmp-primary': this.snmpPrimary,
            'descr': this.description,
            'monitored-service': this.services.map(s => s.generateModel()),
            'status': 1
        };
    }

}