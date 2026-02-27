import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { I18nService } from 'nestjs-i18n';
import { AddRoleDto } from './dto/add-role.dto';
import { ApiUtil } from 'src/common/utils/api-util';
import { AdminAuthenticateGuard } from '../admins-auth/guards/admins-auth.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRoleDto } from './dto/get-role.dto';
import { AddOrRemovePermissionsDto } from './dto/add-or-remove-permissions.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { AdminPermissionsGuard } from '../admins-auth/guards/admins-permissions.guard';

@Controller('dashboard/roles')
@UseGuards(AdminAuthenticateGuard, AdminPermissionsGuard)
export class RolesController {
    constructor(
        private readonly i18nService: I18nService,
        private readonly rolesService: RolesService,
    ) {}

    @Post('add-role')
    async addRole(@Body() data: AddRoleDto) {
        const role = await this.rolesService.addRole(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentCreated'),
            role,
        );
    }

    @Patch('update-role')
    async updateRole(@Body() data: UpdateRoleDto) {
        const role = await this.rolesService.updateRole(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentUpdated'),
            role,
        );
    }

    @Get('get-all-roles')
    async getAllRoles(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        const { roles, totalCount, totalPages } =
            await this.rolesService.getAllRoles(page, limit);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentsFetched'),
            roles,
            totalCount,
            page,
            totalPages,
        );
    }

    @Get('get-role/:id')
    async getRole(@Param() data: GetRoleDto) {
        const role = await this.rolesService.getRole(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentFetched'),
            role,
        );
    }

    @Get('get-all-permissions')
    getAllPermissions() {
        const permissions = this.rolesService.getAllPermissions();

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentsFetched'),
            permissions,
        );
    }

    @Post('add-permissions-to-role')
    async addPermissionsToRole(@Body() data: AddOrRemovePermissionsDto) {
        const role = await this.rolesService.addPermissionsToRole(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentUpdated'),
            role,
        );
    }

    @Post('remove-permissions-from-role')
    async removePermissionsFromRole(@Body() data: AddOrRemovePermissionsDto) {
        const role = await this.rolesService.removePermissionsFromRole(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentUpdated'),
            role,
        );
    }

    @Delete('delete-role')
    async deleteRole(@Body() data: DeleteRoleDto) {
        await this.rolesService.deleteRole(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.documentDeleted'),
        );
    }
}
