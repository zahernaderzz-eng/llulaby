import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketIoGateway } from './socket-io-gateway';
import { IdentitiesModule } from '../../modules/identities/identities.module';
import { UserTokensModule } from '../../modules/user-tokens/user-tokens.module';

@Module({
    imports: [JwtModule, IdentitiesModule, UserTokensModule],
    providers: [SocketIoGateway],
    exports: [SocketIoGateway],
})
export class SocketIoModule {}
