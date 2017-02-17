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
        let interfaces: OnmsRequisitionInterface[] = [];
        rawInterfaces.forEach(i => interfaces.push(OnmsRequisitionInterface.importInterface(i)));
        return interfaces;
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

    generateModel() : Object {
        let rawInterface: Object = {
            'ip-addr': this.ipAddress,
            'snmp-primary': this.snmpPrimary,
            'descr': this.description,
            'monitored-service': [],
            'status': 1
        };
        this.services.forEach(s => rawInterface['monitored-service'].push(s.generateModel()));
        return rawInterface;
    }

}