import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { usersDbModule } from './db/users.db.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';
import { AuthModule } from '../auth/auth.module';
import { IdentitiesModule } from '../identities/identities.module';
import { ChildrenModule } from '../children/children.module';

@Module({
    imports: [
        usersDbModule,
        UserTokensModule,
        forwardRef(() => AuthModule),
        IdentitiesModule,
        forwardRef(() => ChildrenModule),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [usersDbModule, UsersService],
})
export class UsersModule {}
