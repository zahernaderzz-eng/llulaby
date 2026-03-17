import {
    Controller,
    Get,
    Param,
    Put,
    Body,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { ChildVaccineService } from './child-vaccine.service';
import { ApiUtil } from 'src/common/utils/api-util';
import { I18nService } from 'nestjs-i18n';
import { MarkTakenDto } from './dto/mark-taken.dto';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';
import { ReturnObject } from 'src/common/return-object/return-object';

@Controller('children/vaccines')
export class ChildVaccinesController {
    constructor(
        private readonly childVaccineService: ChildVaccineService,
        private readonly i18nService: I18nService,
        private readonly returnObject: ReturnObject,
    ) { }

    @UseGuards(AuthenticateGuardFactory())
    @Get('all')
    async all(
        @Req() request: any,
        @Query('type') type: 'all' | 'done' | 'upcoming' | 'overdue' | 'missed' = 'all',
    ) {
        const userId = request['user']['id']


        const data = await this.childVaccineService.getAllForChild(
            userId,
            type,
        );
        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.vaccinesFetched'),
            { vaccines: data.map((v) => this.returnObject.childVaccineDetails(v)) },
        );
    }


}
