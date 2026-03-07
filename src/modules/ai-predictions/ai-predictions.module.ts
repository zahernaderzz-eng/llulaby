import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiPredictionsService } from './ai-predictions.service';
import { AiPredictionsController } from './ai-predictions.controller';
import { IdentitiesModule } from '../identities/identities.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';
import { ChildrenModule } from '../children/children.module';


@Module({
    imports: [HttpModule, IdentitiesModule, UserTokensModule, ChildrenModule],
    controllers: [AiPredictionsController],
    providers: [AiPredictionsService],
})
export class AiPredictionsModule { }

