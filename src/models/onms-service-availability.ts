export class OnmsServiceAvailability {

    public id: number;
    public name: string;
    public availability: number;

    static importService(rawService: Object): OnmsServiceAvailability {
        return Object.assign(new OnmsServiceAvailability(), rawService);
    }

    static importServices(rawServices: Object[]): OnmsServiceAvailability[] {
        return rawServices.map(s => OnmsServiceAvailability.importService(s));
    }

}