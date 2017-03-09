export class OnmsDestination {

    public id: number;
    public autoNotify: string;
    public userId: string;
    public notifyTime: string;
    public media: string;

    static importDestination(rawDestination: Object): OnmsDestination {
        return Object.assign(new OnmsDestination(), rawDestination);
    }

    static importDestinations(rawDestinations: Object[]): OnmsDestination[] {
        if (!rawDestinations || rawDestinations.length == 0) {
            return [];
        }
        return rawDestinations.map(d => OnmsDestination.importDestination(d));
    }

}