import { Module } from '@nestjs/common';
import { AdminsAuthModule } from '../admins-auth/admins-auth.module';
import { DashboardUsersModule } from '../dashboard-users/dashboard-users.module';

@Module({
    imports: [AdminsAuthModule, DashboardUsersModule],
})
export class DashboardModule {}
