import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @UseGuards(AuthenticateGuardFactory())
    @Post('send-to-all')
    async sendToAll(
        @Body() body: { title: string; body: string; data?: any; key?: string },
    ) {
        await this.notificationsService.sendToAll({
            title: body.title,
            body: body.body,
            data: body.data,
            key: body.key || 'GENERAL_NOTIFICATION',
            saveToDb: true,
        });

        return {
            success: true,
            message: 'Notifications broadcasted successfully to all users',
        };
    }
}
