export class OnmsDestination {

    constructor(
        public id: number,
        public autoNotify: string,
        public userId: string,
        public notifyTime: string,
        public media: string
    ) {}

    static importDestination(e: Object): OnmsDestination {
        if (!e) {
            return null;
        }
        let destination = new OnmsDestination(
            e['id'],
            e['autoNotify'],
            e['userId'],
            e['notifyTime'],
            e['media']
        );
        return destination;
    }

    static importDestinations(rawDestinations: Object[]): OnmsDestination[] {
        if (!rawDestinations || rawDestinations.length == 0) {
            return [];
        }
        let destinations: OnmsDestination[] = [];
        rawDestinations.forEach(o => destinations.push(OnmsDestination.importDestination(o)));
        return destinations;
    }

}