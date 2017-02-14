export class OnmsAck {

    constructor(
        public id: number,
        public ackType: string,
        public ackTime: number,
        public ackAction: string,
        public refId: number,
        public ackUser: string
    ) {}

    static importAck(e: Object): OnmsAck {
        if (!e) {
            return null;
        }
        let ack = new OnmsAck(
            e['id'],
            e['ackType'],
            e['ackTime'],
            e['ackAction'],
            e['refId'],
            e['ackUser']
        );
        return ack;
    }

}