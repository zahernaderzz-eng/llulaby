import { Controller, Get, Query } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { ApiUtil } from 'src/common/utils/api-util';
import { I18nService } from 'nestjs-i18n';

@Controller('countries')
export class CountriesController {
    constructor(
        private readonly countriesService: CountriesService,
        private readonly i18nService: I18nService,
    ) {}

    @Get()
    async getAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        const { countries, totalCount, totalPages } =
            await this.countriesService.getAll(page, limit);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.countriesFetched'),
            countries,
            totalCount,
            page,
            totalPages,
        );
    }
}
