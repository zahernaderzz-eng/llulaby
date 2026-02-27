import { Module } from '@nestjs/common';
import { DashboardUsersService } from './dashboard-users.service';
import { DashboardUsersController } from './dashboard-users.controller';
import { UsersModule } from '../users/users.module';
import { IdentitiesModule } from '../identities/identities.module';

@Module({
    imports: [UsersModule, IdentitiesModule],
    controllers: [DashboardUsersController],
    providers: [DashboardUsersService],
})
export class DashboardUsersModule {}
