import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { AppException } from 'src/common/exceptions/app.exception';
import { I18nService } from 'nestjs-i18n';
import { ReturnObject } from 'src/common/return-object/return-object';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { ImageUtil } from 'src/common/utils/image.util';
import { AuthHelper } from '../auth/helpers/auth.helper';
import { IdentitiesService } from '../identities/identities.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateIdentifierDto } from './dto/update-identifier.dto';
import { OtpUtil } from 'src/common/utils/otp-util';
import { AuthUtil } from 'src/common/utils/auth-util';
import type { RedisClientType } from 'redis';

@Injectable()
export class UsersService {
    constructor(
        private readonly identityService: IdentitiesService,
        private readonly i18nService: I18nService,
        private readonly returnObject: ReturnObject,
        private readonly authHelper: AuthHelper,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    ) {}

    async create(data: User): Promise<UserDocument> {
        return await this.userModel.create(data);
    }

    async findOne(
        filter: any,
        options?: { populate?: any; lean?: boolean },
    ): Promise<UserDocument | null> {
        const query = this.userModel.findOne(filter);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async findById(
        id: string,
        options?: { populate?: any; lean?: boolean },
    ): Promise<UserDocument | null> {
        const query = this.userModel.findById(id);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async findByIdAndUpdate(
        id: string,
        data: Partial<User>,
        options?: { populate?: any; lean?: boolean },
    ): Promise<UserDocument | null> {
        const query = this.userModel.findByIdAndUpdate(id, data, { new: true });

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async getProfile(id: string) {
        const identity = await this.identityService.findOne(
            {
                _id: id,
                status: 'active',
                dataCompleted: true,
                isVerified: true,
            },
            {
                populate: { path: 'user', populate: { path: 'country' } },
                lean: false,
            },
        );

        if (!identity)
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );

        return this.returnObject.user((identity as any).user, identity);
    }

    async updateProfile(
        id: string,
        data: UpdateMyProfileDto,
        avatar?: Express.Multer.File,
    ) {
        const identity = await this.identityService.findOne(
            {
                _id: id,
                status: 'active',
                dataCompleted: true,
                isVerified: true,
            },
            { lean: false },
        );

        if (!identity)
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );

        const user = await this.findOne(
            { identity: identity._id },
            { lean: false },
        );

        if (!user)
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );

        if (avatar) {
            if (user.avatar) await ImageUtil.removeAvatar('users', user.avatar);
            data.avatar = await ImageUtil.processAndSaveAvatar(
                avatar.buffer,
                'users',
            );
        }

        const updatedUser = await this.findByIdAndUpdate(user.id, data, {
            populate: { path: 'country' },
            lean: false,
        });

        return this.returnObject.userProfile(updatedUser!, identity);
    }

    async updatePassword(id: string, data: UpdatePasswordDto) {
        const identity = await this.identityService.findOne(
            {
                _id: id,
                status: 'active',
                dataCompleted: true,
                isVerified: true,
            },
            { lean: false },
        );

        if (!identity)
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );

        if (!(await (identity as any).comparePassword(data.oldPassword))) {
            throw new AppException(
                this.i18nService.t('messages.wrongPassword'),
                400,
            );
        }

        identity.password = data.newPassword;
        await identity.save();

        await Promise.all([
            this.authHelper.deleteAllUserTokens(identity.id),
            this.authHelper.deleteAllUserDevices(identity.id),
        ]);
    }

    async softDeleteProfile(id: string) {
        const deletedIdentity = await this.identityService.softDeleteByFilter({
            _id: id,
            status: 'active',
            dataCompleted: true,
            isVerified: true,
        });

        if (!deletedIdentity)
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );

        await Promise.all([
            this.authHelper.deleteAllUserTokens(deletedIdentity.id),
            this.authHelper.deleteAllUserDevices(deletedIdentity.id),
            this.redisClient.del(`identity-type-${deletedIdentity.id}`),
        ]);
    }

    async deleteById(id: string) {
        return await this.userModel.findByIdAndDelete(id);
    }

    async deleteByFilter(filter: { [key: string]: any }) {
        return await this.userModel.findOneAndDelete(filter);
    }

    async updateIdentifier(id: string, data: UpdateIdentifierDto) {
        const identity = await this.identityService.findOne(
            {
                _id: id,
                status: 'active',
                dataCompleted: true,
                isVerified: true,
            },
            { lean: false },
        );

        if (!identity)
            throw new AppException(
                this.i18nService.t('messages.userNotFound'),
                400,
            );
        if (
            identity.email === data.identifier ||
            identity.phone === data.identifier
        ) {
            throw new AppException(
                this.i18nService.t('messages.sameIdentifier'),
                400,
            );
        }

        const type = AuthUtil.getIdentifierType(data.identifier);
        const otp = OtpUtil.generateOtp();
        const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

        if (type === 'email') identity.email = data.identifier;
        else identity.phone = data.identifier;

        identity.isVerified = false;
        identity.otp = otp;
        identity.otpExpireAt = otpExpireAt;

        await identity.save();

        void this.authHelper.sendOtpWithIdentifier(data.identifier, otp);

        await Promise.all([
            this.authHelper.deleteAllUserTokens(identity.id),
            this.authHelper.deleteAllUserDevices(identity.id),
        ]);
    }

    async test() {
        await this.userModel.create({
            name: 'test',
        });
        return 'success this is server for our graduation project';
    }
}
