import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthHelper } from './helpers/auth.helper';
import { CountriesModule } from '../countries/countries.module';
import { DevicesModule } from '../devices/devices.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';
import { AuthenticaModule } from 'src/services/authentica/authentica.module';
import { NodeMailerModule } from 'src/services/nodemailer/mailer.module';
import { PasswordsMatch } from './validation/passwords-match';
import { IdentitiesModule } from '../identities/identities.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        IdentitiesModule,
        forwardRef(() => UsersModule),
        CountriesModule,
        DevicesModule,
        UserTokensModule,
        AuthenticaModule,
        NodeMailerModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthHelper, PasswordsMatch],
    exports: [AuthService, AuthHelper],
})
export class AuthModule {}
