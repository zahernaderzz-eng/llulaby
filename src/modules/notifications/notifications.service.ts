import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationSender } from './notifications-sender';
import { ISendNotificationData } from './interfaces/send-notification-date.interface';
import { IdentitiesService } from '../identities/identities.service';
import { DevicesService } from '../devices/devices.service';
import { UserDocument } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly sender: NotificationSender,
        private readonly identitiesService: IdentitiesService,
        private readonly devicesService: DevicesService,
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
    ) {}

    async send(data: ISendNotificationData) {
        const identities = await this.identitiesService.find(
            {
                _id: { $in: data.receivers },
            },
            { populate: 'user' },
        );

        await Promise.allSettled(
            identities.map((identity) => this.sendToIdentity(identity, data)),
        );
    }

    private async sendToIdentity(identity, data: ISendNotificationData) {
        const user = identity.user as UserDocument;

        // notifications disabled
        if (!user?.isNotify) {
            return;
        }

        const devices = await this.devicesService.find({ user: user._id });

        if (!devices.length) return;

        const badge = (user.notificationsCount || 0) + 1;

        await Promise.allSettled(
            devices.map((device) => {
                const message = this.sender.buildMessage(
                    device.fcmToken,
                    device.deviceType,
                    {
                        title: data.title,
                        body: data.body,
                        data: {
                            key: data.key,
                            ...data.data,
                            badge: String(badge),
                        },
                    },
                );

                return this.sender.send(message);
            }),
        );

        // update user badge
        user.notificationsCount = badge;
        await user.save();

        // optional DB storage
        if (data.saveToDb) {
            await this.notificationModel.create({
                receiverIdentity: identity._id,
                title: data.title,
                body: data.body,
                key: data.key,
                data: data.data,
            });
        }
    }

    async create(data: Notification) {
        return await this.notificationModel.create(data);
    }
}
