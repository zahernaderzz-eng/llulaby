import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { UsersCommonHelper } from './helpers/users-common.helper';

@Module({
    imports: [UsersModule],
    providers: [UsersCommonHelper],
    exports: [UsersCommonHelper],
})
export class UsersCommonModule {}
