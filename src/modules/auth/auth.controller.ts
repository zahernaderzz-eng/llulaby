import {
    Body,
    Controller,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { avatarInterceptor } from '../../common/interceptors/avatar.interceptor';
import { ApiUtil } from 'src/common/utils/api-util';
import { I18nService } from 'nestjs-i18n';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthenticateGuardFactory } from './guards/authenticate.guard';
import { ResetPasswordDto } from './dto/reset-password';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyForgotPasswordDto } from './dto/verify-forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly i18nService: I18nService,
    ) { }

    @Post('signup')
    @UseInterceptors(avatarInterceptor)
    async signup(
        @Body() data: SignupDto,
        @UploadedFile() avatar?: Express.Multer.File,
    ) {
        const { token, userObj: user } = await this.authService.signup(
            data,
            avatar,
        );

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.signupSuccess'),
            { token, user },
        );
    }

    @Post('request-otp')
    async requestOtp(@Body() data: RequestOtpDto) {
        await this.authService.requestOtp(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.otpSentSuccessfully'),
            {},
        );
    }

    @Post('verify-otp')
    async verifyOtp(@Body() data: VerifyOtpDto) {
        await this.authService.verifyOtp(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.otpVerifiedSuccessfully'),
            {},
        );
    }

    @Post('signin')
    async signin(@Body() data: SigninDto) {
        const { token, userObj: user } = await this.authService.signin(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.loginSuccess'),
            {
                token,
                user,
            },
        );
    }

    @Post('signout')
    @UseGuards(AuthenticateGuardFactory())
    async signout(@Req() request: Request) {
        await this.authService.signout(request['user']['id']);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.signoutSuccess'),
            {},
        );
    }

    @Post('reset-password')
    async resetPassword(@Body() data: ResetPasswordDto) {
        await this.authService.resetPassword(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.passwordResetSuccess'),
            {},
        );
    }

    @Post('change-password')
    @UseGuards(AuthenticateGuardFactory())
    async changePassword(@Req() request: Request, @Body() data: ChangePasswordDto) {
        await this.authService.changePassword(request['user']['id'], data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.passwordUpdated'),
            {},
        );
    }

    @Post('forgot-password')
    async forgotPassword(@Body() data: ForgotPasswordDto) {
        await this.authService.forgotPassword(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.otpSentSuccessfully'),
            {},
        );
    }

    @Post('verify-forgot-password')
    async verifyForgotPassword(@Body() data: VerifyForgotPasswordDto) {
        await this.authService.verifyForgotPassword(data);

        return ApiUtil.formatResponse(
            200,
            this.i18nService.t('messages.passwordResetSuccess'),
            {},
        );
    }
}
