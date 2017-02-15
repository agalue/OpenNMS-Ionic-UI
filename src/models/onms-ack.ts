export class OnmsAck {

    public id: number;
    public ackType: string;
    public ackTime: number;
    public ackAction: string;
    public refId: number;
    public ackUser: string;

    static importAck(rawAck: Object): OnmsAck {
        return Object.assign(new OnmsAck(), rawAck);
    }

}