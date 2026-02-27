import { forwardRef, Module } from '@nestjs/common';
import { AdminsAuthService } from './admins-auth.service';
import { AdminsAuthController } from './admins-auth.controller';
import { RolesModule } from '../roles/roles.module';
import { AdminPermissionsGuard } from './guards/admins-permissions.guard';
import { IdentitiesModule } from '../identities/identities.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [forwardRef(() => RolesModule), IdentitiesModule, AuthModule],
    controllers: [AdminsAuthController],
    providers: [AdminsAuthService, AdminPermissionsGuard],
    exports: [AdminsAuthService],
})
export class AdminsAuthModule {}
