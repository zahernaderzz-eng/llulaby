import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatbotClientService } from './chatbot-client.service';
import { ChatbotController } from './chatbot.controller';
import { IdentitiesModule } from '../identities/identities.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';

@Module({
    imports: [HttpModule, IdentitiesModule, UserTokensModule],
    controllers: [ChatbotController],
    providers: [ChatbotClientService],
    exports: [ChatbotClientService],
})
export class ChatbotModule {}
