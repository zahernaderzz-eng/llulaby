import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../core/firebase/firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationSender {
    constructor(private readonly firebase: FirebaseService) {}

    buildMessage(
        token: string,
        deviceType: string,
        payload: {
            title: string;
            body: string;
            data: Record<string, any>;
            badge?: number;
            url?: string;
        },
    ): admin.messaging.Message {
        const message: admin.messaging.Message = {
            token,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
        };

        if (deviceType === 'ios') {
            message.apns = {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: payload.badge,
                    },
                },
            };
        }

        if (deviceType === 'android') {
            message.android = {
                notification: {
                    sound: 'default',
                    channelId: 'default_channel',
                },
                data: {
                    badge: String(payload.badge),
                },
            };
        }

        if (deviceType === 'web') {
            message.webpush = {
                headers: { Urgency: 'high' },
                notification: {
                    icon: 'fcm_push_icon',
                    click_action: payload.url,
                },
            };
        }

        return message;
    }

    async send(message: admin.messaging.Message) {
        return this.firebase.getMessaging().send(message);
    }
}
