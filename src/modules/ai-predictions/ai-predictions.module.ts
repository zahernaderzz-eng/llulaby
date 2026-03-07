import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiPredictionsController } from './ai-predictions.controller';
import { AiPredictionsService } from './ai-predictions.service';

@Module({
    imports: [HttpModule],
    controllers: [AiPredictionsController],
    providers: [AiPredictionsService],
})
export class AiPredictionsModule { }
