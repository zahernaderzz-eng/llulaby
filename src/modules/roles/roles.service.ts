import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './entities/role.enitity';
import { Model } from 'mongoose';
import { AddRoleDto } from './dto/add-role.dto';
import { ReturnObject } from 'src/common/return-object/return-object';
import { I18nService } from 'nestjs-i18n';
import { AppException } from 'src/common/exceptions/app.exception';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SharedVariables } from 'src/common/shared-variables/shared-variables';
import { GetRoleDto } from './dto/get-role.dto';
import { AddOrRemovePermissionsDto } from './dto/add-or-remove-permissions.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { AdminsService } from '../admins/admins.service';

@Injectable()
export class RolesService {
    constructor(
        private readonly i18nService: I18nService,
        private readonly returnObject: ReturnObject,
        private readonly sharedVariables: SharedVariables,
        private readonly adminsService: AdminsService,
        @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    ) {}

    async addRole(data: AddRoleDto) {
        const exists = await this.roleModel.exists({
            $or: [{ 'name.ar': data.nameAr }, { 'name.en': data.nameEn }],
        });

        if (exists) {
            throw new AppException(
                this.i18nService.t('messages.duplicateName'),
                400,
            );
        }

        const role = await this.roleModel.create({
            name: { ar: data.nameAr, en: data.nameEn },
            permissions: data.permissions ?? [],
        });

        return this.returnObject.role(role);
    }

    async updateRole(data: UpdateRoleDto) {
        const role = await this.roleModel.findById(data.id);

        if (!role || role.status === 'deleted') {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                400,
            );
        }

        if (role.isSuperAdmin) {
            throw new AppException(
                this.i18nService.t('messages.cantModifySuperAdmin'),
                400,
            );
        }

        const exists = await this.roleModel.exists({
            $or: [{ 'name.ar': data.nameAr }, { 'name.en': data.nameEn }],
            _id: { $ne: data.id },
        });

        if (exists) {
            throw new AppException(
                this.i18nService.t('messages.duplicateName'),
                400,
            );
        }

        role.name.ar = data.nameAr ?? role.name.ar;
        role.name.en = data.nameEn ?? role.name.en;

        await role.save();

        return this.returnObject.role(role);
    }

    async getAllRoles(page = 1, limit = 10) {
        const filter = { status: 'active' };
        const skip = (page - 1) * limit;

        const [roles, totalCount] = await Promise.all([
            this.roleModel.find(filter).skip(skip).limit(limit).lean(),
            this.roleModel.countDocuments(filter),
        ]);

        return {
            roles: roles.map((role) => this.returnObject.role(role)),
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async getRole(data: GetRoleDto) {
        const role = await this.roleModel.findById(data.id).lean();

        if (!role || role.status === 'deleted') {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                400,
            );
        }

        return this.returnObject.role(role);
    }

    getAllPermissions() {
        return this.sharedVariables.ADMIN_PERMISSIONS;
    }

    async addPermissionsToRole(data: AddOrRemovePermissionsDto) {
        const role = await this.roleModel.findById(data.id);

        if (!role || role.status === 'deleted') {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                400,
            );
        }

        const existingPermissions = new Set(role.permissions);
        const newPermissions = data.permissions.filter(
            (p) => !existingPermissions.has(p),
        );

        if (newPermissions.length > 0) {
            role.permissions.push(...newPermissions);
            await role.save();
        }

        return this.returnObject.role(role);
    }

    async removePermissionsFromRole(data: AddOrRemovePermissionsDto) {
        const role = await this.roleModel.findById(data.id);

        if (!role || role.status === 'deleted') {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                400,
            );
        }

        if (role.isSuperAdmin) {
            throw new AppException(
                this.i18nService.t('messages.cantModifySuperAdmin'),
                400,
            );
        }

        const toRemove = new Set(data.permissions);
        const filteredPermissions = role.permissions.filter(
            (p) => !toRemove.has(p),
        );

        if (filteredPermissions.length !== role.permissions.length) {
            role.permissions = filteredPermissions;
            await role.save();
        }

        return this.returnObject.role(role);
    }

    async deleteRole(data: DeleteRoleDto) {
        const role = await this.roleModel.findById(data.id);

        if (!role || role.status === 'deleted') {
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                400,
            );
        }

        if (role.isSuperAdmin) {
            throw new AppException(
                this.i18nService.t('messages.cantDeleteSuperAdmin'),
                400,
            );
        }

        role.status = 'deleted';
        await role.save();

        await this.adminsService.softDeleteMany({ role: role._id });

        return this.returnObject.role(role);
    }

    async create(role: Role) {
        return await this.roleModel.create(role);
    }

    async findOne(filter: any, options?: { populate?: any; lean?: boolean }) {
        const query = this.roleModel.findOne(filter);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async find(filter: any, options?: { populate?: any; lean?: boolean }) {
        const query = this.roleModel.find(filter);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async findById(id: string, options?: { populate?: any; lean?: boolean }) {
        const query = this.roleModel.findById(id);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async findByIdAndUpdate(
        id: string,
        role: Partial<Role>,
        options?: { populate?: any; lean?: boolean },
    ) {
        const query = this.roleModel.findByIdAndUpdate(id, role, {
            new: true,
        });

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }
}
