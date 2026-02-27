import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { rolesDbModule } from './db/roles.db.module';
import { AdminsModule } from '../admins/admins.module';
import { IdentitiesModule } from '../identities/identities.module';

@Module({
    imports: [rolesDbModule, forwardRef(() => AdminsModule), IdentitiesModule],
    controllers: [RolesController],
    providers: [RolesService],
    exports: [RolesService],
})
export class RolesModule {}
