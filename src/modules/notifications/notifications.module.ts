import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { notificationsDbModule } from './db/notifications.db.module';
import { NotificationSender } from './notifications-sender';
import { FirebaseModule } from 'src/core/firebase/firebase.module';
import { DevicesModule } from '../devices/devices.module';
import { IdentitiesModule } from '../identities/identities.module';

@Module({
    imports: [
        notificationsDbModule,
        FirebaseModule,
        DevicesModule,
        IdentitiesModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationSender],
    exports: [NotificationsService],
})
export class NotificationsModule {}
