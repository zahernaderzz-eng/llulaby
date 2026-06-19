import {
    Controller,
    Get,
    UseGuards,
    Req,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { AuthenticateGuardFactory } from '../modules/auth/guards/authenticate.guard';
import { I18nService } from 'nestjs-i18n';
import { ApiUtil } from '../common/utils/api-util';

@Controller('recommendation')
export class RecommendationController {
    private readonly logger = new Logger(RecommendationController.name);

    constructor(
        private readonly recommendationService: RecommendationService,
        private readonly i18nService: I18nService,
    ) {}

    @Get()
    @UseGuards(AuthenticateGuardFactory())
    async getRecommendation(@Req() request: any) {
        try {
            const userId = request.user?.id;

            this.logger.log(
                `Recommendation request received for user: ${userId}`,
            );

            const recommendation =
                await this.recommendationService.getRecommendation(userId);

            // استخراج البيانات المهمة فقط
            const formattedData = {
                infantId: recommendation.data?.infant_id,
                infantName: recommendation.data?.infant_name,
                recommendation: recommendation.data?.recommendation,
                priority: {
                    level: recommendation.data?.priority_level,
                    name: recommendation.data?.priority_name,
                },
                action: recommendation.data?.action,
                reason: recommendation.data?.reason,
                confidence: recommendation.data?.confidence,
                vitalsSummary: recommendation.data?.vitals_summary,
                cryAnalysis: recommendation.data?.cry_analysis
                    ? {
                          type: recommendation.data.cry_analysis.type,
                          intensity: recommendation.data.cry_analysis.intensity,
                          confidence:
                              recommendation.data.cry_analysis.confidence,
                      }
                    : null,
                historyAnalysis: recommendation.data?.history_analysis
                    ? {
                          patternDetected:
                              recommendation.data.history_analysis
                                  .pattern_detected,
                          repeatedIssue:
                              recommendation.data.history_analysis
                                  .repeated_issue,
                          timeSinceLastSimilar:
                              recommendation.data.history_analysis
                                  .time_since_last_similar,
                          frequencyLast24h:
                              recommendation.data.history_analysis
                                  .frequency_last_24h,
                      }
                    : null,
                timestamp: recommendation.data?.timestamp,
            };

            return ApiUtil.formatResponse(
                HttpStatus.OK,
                this.i18nService.t('messages.recommendationFetchedSuccess', {
                    defaultValue: 'Recommendation fetched successfully',
                }),
                formattedData,
            );
        } catch (error) {
            this.logger.error('Error in getRecommendation endpoint:', error);
            throw error;
        }
    }
}
