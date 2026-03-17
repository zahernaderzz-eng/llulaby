import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
} from '@nestjs/common';
import { VaccineService } from './vaccine.service';
import { ApiUtil } from 'src/common/utils/api-util';
import { I18nService } from 'nestjs-i18n';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';

@Controller('vaccines')
export class VaccineController {
    constructor(
        private readonly vaccineService: VaccineService,
        private readonly i18nService: I18nService,
    ) {}

    @Post()
    async create(@Body() createDto: CreateVaccineDto) {
        const vaccine = await this.vaccineService.create(createDto);

        return ApiUtil.formatResponse(
            201,
            this.i18nService.t('messages.vaccineCreated'),
            { vaccine },
        );
    }

    @Get()
    async getAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        const { vaccines, totalCount, totalPages } =
            await this.vaccineService.getAll(page, limit);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.vaccinesFetched'),
            { vaccines },
            totalCount,
            page,
            totalPages,
        );
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        const vaccine = await this.vaccineService.findById(id);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.vaccineFetched'),
            { vaccine },
        );
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateVaccineDto) {
        const vaccine = await this.vaccineService.update(id, updateDto);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.vaccineUpdated'),
            { vaccine },
        );
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.vaccineService.remove(id);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.vaccineDeleted'),
            {},
        );
    }
}
