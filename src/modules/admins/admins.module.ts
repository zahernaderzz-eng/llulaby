import { forwardRef, Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { adminsDbModule } from './db/admins.db.module';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { IdentitiesModule } from '../identities/identities.module';

@Module({
    imports: [
        adminsDbModule,
        forwardRef(() => RolesModule),
        AuthModule,
        IdentitiesModule,
    ],
    controllers: [AdminsController],
    providers: [AdminsService],
    exports: [AdminsService],
})
export class AdminsModule {}
