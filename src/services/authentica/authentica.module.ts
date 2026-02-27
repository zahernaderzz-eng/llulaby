import { Module } from '@nestjs/common';
import { AuthenticaService } from './authentica.service';

@Module({
    providers: [AuthenticaService],
    exports: [AuthenticaService],
})
export class AuthenticaModule {}
