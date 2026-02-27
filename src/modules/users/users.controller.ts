import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';
import { ApiUtil } from 'src/common/utils/api-util';
import { I18nService } from 'nestjs-i18n';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { avatarInterceptor } from '../../common/interceptors/avatar.interceptor';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateIdentifierDto } from './dto/update-identifier.dto';
import { GetOtherProfileDto } from './dto/get-other-profile.dto';

@Controller('users')
@UseGuards(AuthenticateGuardFactory())
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly i18nService: I18nService,
    ) {}

    @Get('my-profile')
    async getMyProfile(@Req() request: Request) {
        const profile = await this.usersService.getProfile(
            request['user']['id'],
        );

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.profileFetched'),
            profile,
        );
    }

    @Delete('my-profile')
    async deleteMyProfile(@Req() request: Request) {
        await this.usersService.softDeleteProfile(request['user']['id']);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.profileDeleted'),
        );
    }

    @Get('other-profile/:id')
    async getOtherProfile(@Param() data: GetOtherProfileDto) {
        const profile = await this.usersService.getProfile(data.id);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.profileFetched'),
            profile,
        );
    }

    @Patch('my-profile')
    @UseInterceptors(avatarInterceptor)
    async updateMyProfile(
        @Req() request: Request,
        @Body() data: UpdateMyProfileDto,
        @UploadedFile() avatar?: Express.Multer.File,
    ) {
        const profile = await this.usersService.updateProfile(
            request['user']['id'],
            data,
            avatar,
        );

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.profileUpdated'),
            profile,
        );
    }

    @Patch('my-password')
    async updatePassword(
        @Req() request: Request,
        @Body() data: UpdatePasswordDto,
    ) {
        await this.usersService.updatePassword(request['user']['id'], data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.passwordUpdated'),
        );
    }

    @Patch('my-identifier')
    async updateIdentifier(
        @Req() request: Request,
        @Body() data: UpdateIdentifierDto,
    ) {
        await this.usersService.updateIdentifier(request['user']['id'], data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.identifierUpdated'),
        );
    }
}
