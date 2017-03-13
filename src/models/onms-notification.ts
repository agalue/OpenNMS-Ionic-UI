import { OnmsAck } from './onms-ack';
import { OnmsDestination } from './onms-destination';
import { OnmsSeverities } from './onms-severities';
import { HtmlUtils } from './html-utils';

export class OnmsNotification {

    public id: number;
    public name: string;
    public uei: string;
    public severity: string;
    public nodeId: number;
    public nodeLabel: string;
    public subject: string;
    public textMessage: string;
    public pageTime: number;
    public eventId: number;
    public ackUser: string;
    public ackTime: number;
    public destinations: OnmsDestination[] = [];

    static importNotification(rawNotification: Object): OnmsNotification {
        if (!rawNotification) return null;
        let notification = Object.assign(new OnmsNotification(), rawNotification);
        notification.destinations = OnmsDestination.importDestinations(rawNotification['destinations'])
        notification.severity = OnmsSeverities.capitalize(rawNotification['severity']);
        notification.subject = HtmlUtils.removeLinks(notification.subject);
        notification.textMessage = HtmlUtils.removeLinks(notification.textMessage);
        return notification;
    }

    static importNotifications(rawNotifications: Object[]): OnmsNotification[] {
        return rawNotifications.map(n => OnmsNotification.importNotification(n));
    }

    update(ack: OnmsAck) {
        if (ack.ackType != 'NOTIFICATION') {
            return;
        }
        switch (ack.ackAction) {
            case 'ACKNOWLEDGE':
                this.ackTime = ack.ackTime;
                this.ackUser = ack.ackUser;
                break;
            case 'UNACKNOWLEDGE':
                this.ackTime = null;
                this.ackUser = null;
                break;
        }
    }

    isAcknowledged() : boolean {
        return this.ackTime != null;
    }

    getSeverityIndex() {
        return OnmsSeverities.getIndex(this.severity);
    }

}