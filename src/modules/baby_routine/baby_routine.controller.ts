import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { BabyRoutineService } from './baby_routine.service';
import { CreatePhysicalGrowthDto } from './dtos/create-physical-growth.dto';
import { RequestContextExtractor } from 'src/common/utils/payload-req';
import { ApiUtil } from 'src/common/utils/api-util';
import { I18nService } from 'nestjs-i18n';
import { CreateMotorDevelopmentDto } from './dtos/create-motor-development.dto';
import { CreateFeedingDto } from './dtos/create-feeding.dto';

@Controller('baby-routine')
export class BabyRoutineController {
    constructor(
        private readonly babyRoutineService: BabyRoutineService,
        private readonly i18nService: I18nService,
    ) {}

    @Post('create/physical-growth')
    create(@Body() dto: CreatePhysicalGrowthDto) {
        return this.babyRoutineService.createPhysicalGrowth(dto);
    }

    @Post('create/motor-development')
    createMotorDevelopment(@Body() dto: CreateMotorDevelopmentDto) {
        return this.babyRoutineService.createMotorDevelopment(dto);
    }
    @Post('create/feeding')
    createFeeding(@Body() dto: CreateFeedingDto) {
        return this.babyRoutineService.createFeeding(dto);
    }

    @Get('physical-growth/:month')
    async getPhysicalGrowth(
        @Req() request: any,
        @Param('month') month: number,
    ) {
        const { lang } = RequestContextExtractor.extract(request);

        const data = await this.babyRoutineService.getPhysicalGrowth(
            +month,
            lang,
        );

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.babyGrowthDataFetchedSuccess'),
            data,
        );
    }
    @Get('motor-development/:month')
    async getMotorDevelopment(
        @Req() request: any,
        @Param('month') month: number,
    ) {
        const { lang } = RequestContextExtractor.extract(request);

        const data = await this.babyRoutineService.getMotorDevelopment(
            +month,
            lang,
        );

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.motorDevelopmentDataFetchedSuccess'),
            data,
        );
    }

    @Get('feeding/:month')
    async getFeeding(@Req() request: any, @Param('month') month: number) {
        const { lang } = RequestContextExtractor.extract(request);

        const data = await this.babyRoutineService.getFeeding(+month, lang);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.feedingDataFetchedSuccess'),
            data,
        );
    }
}
