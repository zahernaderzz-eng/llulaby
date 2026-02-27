import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminAuthenticateGuard } from '../admins-auth/guards/admins-auth.guard';
import { AdminPermissionsGuard } from '../admins-auth/guards/admins-permissions.guard';
import { I18nService } from 'nestjs-i18n';
import { AddAdminDto } from './dto/add-admin.dto';
import { avatarInterceptor } from 'src/common/interceptors/avatar.interceptor';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { GetAdminDto } from './dto/get-admin.dto';
import { DeleteAdminDto } from './dto/delete-admin.dto';
import { ToggleBlockAdminDto } from './dto/toggle-block-admin.dto';
import type { Request } from 'express';
import { ApiUtil } from 'src/common/utils/api-util';

@Controller('dashboard/admins')
@UseGuards(AdminAuthenticateGuard, AdminPermissionsGuard)
export class AdminsController {
    constructor(
        private readonly adminsService: AdminsService,
        private readonly i18nService: I18nService,
    ) {}

    @Post('add-admin')
    @UseInterceptors(avatarInterceptor)
    async addAdmin(
        @Body() data: AddAdminDto,
        @UploadedFile() avatar?: Express.Multer.File,
    ) {
        const admin = await this.adminsService.addAdmin(data, avatar);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentCreated'),
            admin,
        );
    }

    @Patch('update-admin')
    @UseInterceptors(avatarInterceptor)
    async updateAdmin(
        @Body() data: UpdateAdminDto,
        @Req() request: Request,
        @UploadedFile() avatar?: Express.Multer.File,
    ) {
        const admin = await this.adminsService.updateAdmin(
            data,
            request,
            avatar,
        );

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentUpdated'),
            admin,
        );
    }

    @Get('get-all-admins')
    async getAllAdmins(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        const { admins, totalCount, totalPages } =
            await this.adminsService.getAllAdmins(page, limit);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentsFetched'),
            {
                admins,
                totalCount,
                totalPages,
            },
        );
    }

    @Get('get-admin/:id')
    async getAdmin(@Param() data: GetAdminDto) {
        const admin = await this.adminsService.getAdmin(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentFetched'),
            admin,
        );
    }

    @Delete('delete-admin')
    async deleteAdmin(@Body() data: DeleteAdminDto, @Req() request: Request) {
        await this.adminsService.deleteAdmin(data, request);
        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentDeleted'),
        );
    }

    @Post('toggle-block-admin')
    async toggleBlockAdmin(
        @Body() data: ToggleBlockAdminDto,
        @Req() request: Request,
    ) {
        const newStatus = await this.adminsService.toggleBlockAdmin(
            data,
            request,
        );

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentUpdated'),
            { newStatus },
        );
    }
}
