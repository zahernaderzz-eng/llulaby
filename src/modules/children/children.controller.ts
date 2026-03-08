import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { ApiUtil } from 'src/common/utils/api-util';
import { I18nService } from 'nestjs-i18n';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';
import type { Request } from 'express';

@Controller('children')
export class ChildrenController {
    constructor(
        private readonly childrenService: ChildrenService,
        private readonly i18nService: I18nService,
    ) { }

    @Post()
    @UseGuards(AuthenticateGuardFactory())
    async create(@Req() request: Request, @Body() data: CreateChildDto) {
        const userId = request['user']['id'];
        await this.childrenService.create(userId, data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentUpdated'),
            {},
        );
    }
}
