export class OnmsRequisitionService {

    constructor(
        public name: string
    ) {}

    static importServices(rawServices: Object[]) : OnmsRequisitionService[] {
        let services: OnmsRequisitionService[] = [];
        rawServices.forEach(i => services.push(OnmsRequisitionService.importService(i)));
        return services;
    }

    static importService(rawService: Object) : OnmsRequisitionService {
        return new OnmsRequisitionService(rawService['service-name']);
    }

    generateModel() : Object {
        let rawService: Object = {
            'service-name': this.name,
        };
        return rawService;
    }

}