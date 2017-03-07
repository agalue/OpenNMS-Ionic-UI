import { OnmsIpInterfaceAvailability } from './onms-ip-interface-availability';

export class OnmsNodeAvailability {

    constructor(
        public id: number,
        public availability: number,
        public serviceCount: number,
        public serviceDownCount: number,
        public ipInterfaces: OnmsIpInterfaceAvailability[] = []
    ) {}

    static import(rawNode: Object): OnmsNodeAvailability {
        return new OnmsNodeAvailability(
            rawNode['id'],
            rawNode['availability'],
            rawNode['service-count'],
            rawNode['service-down-count'],
            OnmsIpInterfaceAvailability.importInterfaces(rawNode['ipinterfaces']),
        );
    }

    static create(): OnmsNodeAvailability {
        return new OnmsNodeAvailability(0, 0, 0, 0);
    }

}