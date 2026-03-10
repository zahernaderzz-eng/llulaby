import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ApiUtil } from 'src/common/utils/api-util';
import { avatarInterceptor } from 'src/common/interceptors/avatar.interceptor';
import { I18nService } from 'nestjs-i18n';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';
import type { Request } from 'express';
import console from 'console';

@Controller('children')
export class ChildrenController {
    constructor(
        private readonly childrenService: ChildrenService,
        private readonly i18nService: I18nService,
    ) { }

    @Post()
    @UseGuards(AuthenticateGuardFactory())
    @UseInterceptors(avatarInterceptor)
    async create(
        @Req() request: Request,
        @Body() data: CreateChildDto,
        @UploadedFile() avatar?: Express.Multer.File,
    ) {
        const userId = request['user']['id'];
        await this.childrenService.create(userId, data, avatar);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentUpdated'),
            {},
        );
    }

    @Get()
    @UseGuards(AuthenticateGuardFactory())
    async getProfile(@Req() request: Request) {
        const userId = request['user']['id'];
        console.log(userId);
        const profile = (await this.childrenService.getProfile(userId)) || {};
        console.log('profile=====================>', profile);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentFetched'),
            profile,
        );
    }

    @Patch()
    @UseGuards(AuthenticateGuardFactory())
    @UseInterceptors(avatarInterceptor)
    async update(
        @Req() request: Request,
        @Body() data: UpdateChildDto,
        @UploadedFile() avatar?: Express.Multer.File,
    ) {
        const userId = request['user']['id'];
        await this.childrenService.create(userId, data, avatar);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentUpdated'),
            {},
        );
    }
}
