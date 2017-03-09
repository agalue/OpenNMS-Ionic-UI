export class OnmsRequisitionService {

    constructor(
        public name: string
    ) {}

    static importServices(rawServices: Object[]) : OnmsRequisitionService[] {
        return rawServices.map(s => OnmsRequisitionService.importService(s));
    }

    static importService(rawService: Object) : OnmsRequisitionService {
        return new OnmsRequisitionService(rawService['service-name']);
    }

    generateModel() : Object {
        return {
            'service-name': this.name,
        };
    }

}