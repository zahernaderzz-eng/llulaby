import { Body, Controller, Post } from '@nestjs/common';
import { AdminsAuthService } from './admins-auth.service';
import { AdminSigninDto } from './dto/admin-signin.dto';
import { ApiUtil } from 'src/common/utils/api-util';
import { I18nService } from 'nestjs-i18n';

@Controller('dashboard/admins-auth')
export class AdminsAuthController {
    constructor(
        private readonly i18nService: I18nService,
        private readonly adminsAuthService: AdminsAuthService,
    ) {}

    @Post('signin')
    async signin(@Body() data: AdminSigninDto) {
        const token = await this.adminsAuthService.signin(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.loginSuccess'),
            { token },
        );
    }
}
