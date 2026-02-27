import { Inject, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthHelper } from './helpers/auth.helper';
import { OtpUtil } from 'src/common/utils/otp-util';
import { ReturnObject } from 'src/common/return-object/return-object';
import { ImageUtil } from 'src/common/utils/image.util';
import { RequestOtpDto } from './dto/request-otp.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { I18nService } from 'nestjs-i18n';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthUtil } from 'src/common/utils/auth-util';
import { ResetPasswordDto } from './dto/reset-password';
import { IdentitiesService } from '../identities/identities.service';
import { IdentityDocument } from '../identities/entities/identity.entity';
import { UsersService } from '../users/users.service';
import type { RedisClientType } from 'redis';
import { UserDocument } from '../users/entities/user.entity';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly identitiesService: IdentitiesService,
        private readonly authHelper: AuthHelper,
        private readonly returnObject: ReturnObject,
        private readonly usersService: UsersService,
        private readonly i18nService: I18nService,
        private readonly countriesService: CountriesService,
        @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    ) {}

    async signup(data: SignupDto, avatar?: Express.Multer.File) {
        let identity: IdentityDocument | undefined;
        let user: UserDocument | undefined;
        let avatarFilename: string | undefined;

        try {
            const [emailExists, phoneExists] = await Promise.all([
                this.authHelper.duplicate('email', data.email),
                this.authHelper.duplicate('phone', data.phone),
            ]);

            if (emailExists)
                throw new AppException(
                    this.i18nService.t('messages.duplicateEmail'),
                    400,
                );
            if (phoneExists)
                throw new AppException(
                    this.i18nService.t('messages.duplicatePhone'),
                    400,
                );

            if (data.country) {
                const countryExists = await this.countriesService.findById(
                    data.country,
                    { lean: true },
                );
                if (!countryExists)
                    throw new AppException(
                        this.i18nService.t('messages.invalidCountry'),
                        400,
                    );
            }

            const otp = OtpUtil.generateOtp();
            const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

            if (avatar) {
                avatarFilename = await ImageUtil.processAndSaveAvatar(
                    avatar.buffer,
                    'users',
                );
            }

            identity = await this.identitiesService.create({
                email: data.email,
                phone: data.phone,
                password: data.password,
                type: 'user',
                otp,
                otpExpireAt,
                expireAt: new Date(Date.now() + 60 * 60 * 1000),
                dataCompleted: true,
                canResetPassword: false,
                status: 'active',
                isVerified: false,
            });

            await this.redisClient.set(`identity-type-${identity.id}`, 'user');

            user = await this.usersService.create({
                identity: identity.id,
                name: data.name,
                avatar: avatarFilename || '',
                country: data.country,
                bio: '',
                isNotify: true,
                notificationsCount: 0,
            });

            const token = await this.authHelper.newToken({
                id: identity.id,
                userType: 'user',
            });

            if (data.fcmToken) {
                await this.authHelper.newDevice(
                    identity.id,
                    data.fcmToken,
                    data.deviceType,
                );
            }

            void this.authHelper.sendOtpWithIdentifier(data.email, otp);

            await user.populate({ path: 'country' });

            return { token, userObj: this.returnObject.user(user, identity) };
        } catch (err) {
            if (user) await this.usersService.deleteById(user.id);
            if (identity) await this.identitiesService.deleteById(identity.id);
            if (avatarFilename)
                await ImageUtil.removeAvatar('users', avatarFilename);

            console.error(err);
            if (err instanceof AppException) throw err;
            throw new AppException(
                this.i18nService.t('messages.internalError'),
                500,
            );
        }
    }

    async requestOtp(data: RequestOtpDto) {
        const user = await this.authHelper.getUserByIdentifier(data.identifier);

        if (!user) {
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );
        }

        const otp = OtpUtil.generateOtp();
        const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpireAt = otpExpireAt;
        await user.save();

        await this.authHelper.sendOtpWithIdentifier(data.identifier, otp);
    }

    async verifyOtp(data: VerifyOtpDto) {
        const user = await this.authHelper.getUserByIdentifier(data.identifier);

        if (!user) {
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );
        }

        const validOtp = OtpUtil.verifyOtp(
            data.otp,
            user.otp,
            user.otpExpireAt,
        );

        if (!validOtp) {
            throw new AppException(
                this.i18nService.t('messages.invalidOtp'),
                400,
            );
        }

        if (data.reason === 'verify') {
            user.isVerified = true;
            user.expireAt = undefined;
        } else if (data.reason === 'reset') {
            user.canResetPassword = true;
        }

        user.otp = undefined;
        user.otpExpireAt = undefined;

        await user.save();
    }

    async signin(data: SigninDto) {
        const type = AuthUtil.getIdentifierType(data.identifier);

        const identity = await this.identitiesService.findOne(
            { [type!]: data.identifier, status: 'active' },
            {
                populate: { path: 'user', populate: { path: 'country' } },
                lean: false,
            },
        );

        if (
            !identity ||
            !(await (identity as any).comparePassword(data.password))
        ) {
            throw new AppException(
                this.i18nService.t('messages.invalidCredentials'),
                401,
            );
        }

        const token = await this.authHelper.newToken({
            id: identity.id,
            userType: identity.type,
        });

        if (!identity.isVerified) {
            throw new AppException(
                this.i18nService.t('messages.accountNotVerified'),
                403,
                'verify_account',
                token,
            );
        }

        if (!identity.dataCompleted) {
            throw new AppException(
                this.i18nService.t('messages.dataIncomplete'),
                403,
                'complete_data',
                token,
            );
        }

        if (data.fcmToken) {
            await this.authHelper.newDevice(
                identity.id,
                data.fcmToken,
                data.deviceType,
            );
        }

        return {
            token,
            userObj: this.returnObject.user((identity as any).user, identity),
        };
    }

    async signout(userId: string) {
        await Promise.all([
            this.authHelper.deleteAllUserDevices(userId),
            this.authHelper.deleteAllUserTokens(userId),
        ]);
    }

    async resetPassword(data: ResetPasswordDto) {
        const user = await this.authHelper.getUserByIdentifier(
            data.identifier,
            {
                dataCompleted: true,
                isVerified: true,
            },
        );

        if (!user)
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );
        if (!user.canResetPassword)
            throw new AppException(
                this.i18nService.t('messages.cannotResetPassword'),
                401,
            );

        user.password = data.password;
        user.canResetPassword = false;

        await user.save();

        await Promise.all([
            this.authHelper.deleteAllUserTokens(user.id),
            this.authHelper.deleteAllUserDevices(user.id),
        ]);
    }
}
