import { MongooseModule } from '@nestjs/mongoose';
import {
    NotificationSchema,
    Notification,
} from '../entities/notification.entity';

export const notificationsDbModule = MongooseModule.forFeature([
    { name: Notification.name, schema: NotificationSchema },
]);
