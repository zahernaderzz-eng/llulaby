import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './entities/admin.enitity';
import { Model } from 'mongoose';
import { AddAdminDto } from './dto/add-admin.dto';
import { I18nService } from 'nestjs-i18n';
import { RolesService } from '../roles/roles.service';
import { ReturnObject } from 'src/common/return-object/return-object';
import { ImageUtil } from 'src/common/utils/image.util';
import { AppException } from 'src/common/exceptions/app.exception';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { GetAdminDto } from './dto/get-admin.dto';
import { DeleteAdminDto } from './dto/delete-admin.dto';
import { ToggleBlockAdminDto } from './dto/toggle-block-admin.dto';
import { Request } from 'express';
import { AuthHelper } from '../auth/helpers/auth.helper';
import { IdentityDocument } from '../identities/entities/identity.entity';
import { IdentitiesService } from '../identities/identities.service';

@Injectable()
export class AdminsService {
    constructor(
        private readonly i18nService: I18nService,
        @Inject(forwardRef(() => RolesService))
        private readonly rolesService: RolesService,
        private readonly returnObject: ReturnObject,
        private readonly authHelper: AuthHelper,
        private readonly identitiesService: IdentitiesService,
        @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    ) {}

    async addAdmin(data: AddAdminDto, avatar?: Express.Multer.File) {
        let identity: IdentityDocument | undefined;
        let admin: AdminDocument | undefined;
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

            const role = await this.rolesService.findById(data.role, {
                lean: true,
            });

            if (!role || role.status === 'deleted') {
                throw new AppException(
                    this.i18nService.t('messages.roleNotFound'),
                    400,
                );
            }

            if (role.isSuperAdmin) {
                throw new AppException(
                    this.i18nService.t('messages.cantModifySuperAdmin'),
                    400,
                );
            }

            if (avatar) {
                avatarFilename = await ImageUtil.processAndSaveAvatar(
                    avatar.buffer,
                    'admins',
                );
            }

            identity = await this.identitiesService.create({
                email: data.email,
                phone: data.phone,
                role: data.role,
                password: data.password,
                status: 'active',
                isSuperAdmin: false,
                dataCompleted: true,
                type: 'admin',
                isVerified: true,
                canResetPassword: true,
            });

            admin = await this.create({
                identity: identity.id,
                name: data.name,
                avatar: avatarFilename || '',
            });

            await identity.populate('role');

            return this.returnObject.admin(admin, identity);
        } catch (err) {
            if (admin) await this.deleteById(admin.id);
            if (identity) await this.identitiesService.deleteById(identity.id);
            if (avatarFilename)
                await ImageUtil.removeAvatar('admins', avatarFilename);

            console.error(err);
            if (err instanceof AppException) throw err;
            throw new AppException(
                this.i18nService.t('messages.internalError'),
                500,
            );
        }
    }

    async updateAdmin(
        data: UpdateAdminDto,
        request: Request,
        avatar?: Express.Multer.File,
    ) {
        let newAvatarFilename: string | undefined;

        const identity = await this.identitiesService.findOne(
            { _id: data.id, status: { $ne: 'deleted' } },
            { populate: { path: 'admin' }, lean: false },
        );

        if (!identity) {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                404,
            );
        }

        if (
            identity.isSuperAdmin &&
            request['identity']?.isSuperAdmin !== true
        ) {
            throw new AppException(
                this.i18nService.t('messages.cantModifySuperAdmin'),
                400,
            );
        }

        const [emailExists, phoneExists] = await Promise.all([
            data.email
                ? this.authHelper.duplicate('email', data.email, data.id)
                : false,
            data.phone
                ? this.authHelper.duplicate('phone', data.phone, data.id)
                : false,
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

        if (data.role) {
            const role = await this.rolesService.findById(data.role, {
                lean: true,
            });

            if (!role || role.status === 'deleted') {
                throw new AppException(
                    this.i18nService.t('messages.roleNotFound'),
                    400,
                );
            }

            if (role.isSuperAdmin && !identity.isSuperAdmin) {
                throw new AppException(
                    this.i18nService.t('messages.cantModifySuperAdmin'),
                    400,
                );
            }
        }

        const admin = (identity as any).admin;

        if (avatar) {
            newAvatarFilename = await ImageUtil.processAndSaveAvatar(
                avatar.buffer,
                'admins',
            );
            if (admin.avatar) {
                await ImageUtil.removeAvatar('admins', admin.avatar);
            }
        }

        const [updatedIdentity, updatedAdmin] = await Promise.all([
            this.identitiesService.findByIdAndUpdate(
                identity.id,
                {
                    email: data.email ?? identity.email,
                    phone: data.phone ?? identity.phone,
                    role: data.role ?? identity.role,
                },
                { populate: ['role'], lean: false },
            ),
            this.findByIdAndUpdate(
                admin.id,
                {
                    name: data.name ?? admin.name,
                    avatar: newAvatarFilename ?? admin.avatar,
                },
                { lean: false },
            ),
        ]);

        return this.returnObject.admin(updatedAdmin!, updatedIdentity!);
    }

    async getAllAdmins(page: number = 1, limit: number = 10) {
        const [identities, totalCount] = await Promise.all([
            this.identitiesService.findWithPagination(
                { type: 'admin', status: 'active' },
                page,
                limit,
                { populate: ['admin', 'role'], lean: true },
            ),
            this.identitiesService.count({ type: 'admin', status: 'active' }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        const adminsObjects = identities.map((identity) =>
            this.returnObject.admin((identity as any).admin, identity),
        );

        return {
            admins: adminsObjects,
            totalCount,
            totalPages,
        };
    }

    async getAdmin(data: GetAdminDto) {
        const identity = await this.identitiesService.findById(data.id, {
            populate: ['admin', 'role'],
            lean: true,
        });

        if (!identity || identity.status === 'deleted') {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                404,
            );
        }

        return this.returnObject.admin((identity as any).admin, identity);
    }

    async deleteAdmin(data: DeleteAdminDto, request: Request) {
        const identity = await this.identitiesService.findById(data.id);

        if (!identity || identity.status === 'deleted') {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                404,
            );
        }

        if (identity.isSuperAdmin) {
            throw new AppException(
                this.i18nService.t('messages.cantModifySuperAdmin'),
                400,
            );
        }

        if (identity.id === request['admin']?._id.toString()) {
            throw new AppException(
                this.i18nService.t('messages.cantDeleteYourself'),
                400,
            );
        }

        identity.status = 'deleted';

        await identity.save();
    }

    async toggleBlockAdmin(data: ToggleBlockAdminDto, request: Request) {
        const identity = await this.identitiesService.findById(data.id);

        if (!identity || identity.status === 'deleted') {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                404,
            );
        }

        if (identity.isSuperAdmin) {
            throw new AppException(
                this.i18nService.t('messages.cantModifySuperAdmin'),
                400,
            );
        }

        if (identity.id.toString() === request['admin']?._id.toString()) {
            throw new AppException(
                this.i18nService.t('messages.cantBlockYourself'),
                400,
            );
        }

        identity.status = identity.status === 'active' ? 'blocked' : 'active';
        await identity.save();

        return identity.status;
    }

    async create(admin: Admin) {
        return await this.adminModel.create(admin);
    }

    async findOne(filter: any, options?: { populate?: any; lean?: boolean }) {
        const query = this.adminModel.findOne(filter);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async find(filter: any, options?: { populate?: any; lean?: boolean }) {
        const query = this.adminModel.find(filter);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async findById(id: string, options?: { populate?: any; lean?: boolean }) {
        const query = this.adminModel.findById(id);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async findByIdAndUpdate(
        id: string,
        admin: Partial<Admin>,
        options?: { populate?: any; lean?: boolean },
    ) {
        const query = this.adminModel.findByIdAndUpdate(id, admin, {
            new: true,
        });

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async deleteById(id: string) {
        return await this.adminModel.findByIdAndDelete(id);
    }

    async softDeleteById(id: string) {
        return await this.adminModel.findByIdAndUpdate(
            id,
            { status: 'deleted' },
            {
                new: true,
            },
        );
    }

    async softDeleteMany(filter: { [key: string]: any }) {
        return await this.adminModel.updateMany(filter, { status: 'deleted' });
    }
}
