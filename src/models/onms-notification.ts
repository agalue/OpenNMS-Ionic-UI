import { OnmsEvent } from './onms-event';
import { OnmsAck } from './onms-ack';
import { OnmsDestination } from './onms-destination';
import { ONMS_SEVERITIES } from './onms-severities';

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
        let notification = Object.assign(new OnmsNotification(), rawNotification);
        notification.destinations = OnmsDestination.importDestinations(rawNotification['destinations'])
        notification.severity = OnmsEvent.capitalize(rawNotification['severity']);
        return notification;
    }

    static importNotifications(rawNotifications: Object[]): OnmsNotification[] {
        let notifications: OnmsNotification[] = [];
        rawNotifications.forEach(n => notifications.push(OnmsNotification.importNotification(n)));
        return notifications;
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
        return ONMS_SEVERITIES.indexOf(this.severity);
    }

}