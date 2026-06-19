import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { ChildrenModule } from '../modules/children/children.module';
import { IoTModule } from '../modules/iot/iot.module';
import { UserTokensModule } from 'src/modules/user-tokens/user-tokens.module';
import { IdentitiesModule } from 'src/modules/identities/identities.module';

@Module({
    imports: [ChildrenModule, IoTModule, UserTokensModule, IdentitiesModule],
    controllers: [RecommendationController],
    providers: [RecommendationService],
})
export class RecommendationModule {}
