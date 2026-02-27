import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharedVariables {
    constructor(private readonly configService: ConfigService) {}

    get ADDRESS(): string {
        const env = this.configService.get<string>('NODE_ENV');
        const addressDev = this.configService.get<string>('ADDRESS_DEV');
        const addressProd = this.configService.get<string>('ADDRESS_PROD');
        return env === 'development' ? addressDev! : addressProd!;
    }

    get USER_AVATAR_IMAGES(): string {
        return '/uploads/users/avatars/';
    }

    get ADMIN_AVATAR_IMAGES(): string {
        return '/uploads/admins/avatars/';
    }

    get COUNTRY_IMAGES(): string {
        return '/uploads/countries/';
    }

    get POST_MEDIA(): string {
        return '/uploads/posts/';
    }

    get COMMUNITY_AVATAR_IMAGES(): string {
        return '/uploads/communities/avatars/';
    }

    get ADMIN_PERMISSIONS() {
        return [
            {
                id: '1',
                title: {
                    ar: 'الأدوار',
                    en: 'Roles',
                },
                children: [
                    {
                        title: {
                            ar: 'اضافة دور',
                            en: 'Add Role',
                        },
                        url: '/api/dashboard/roles/add-role',
                    },
                    {
                        title: {
                            ar: 'تعديل دور',
                            en: 'Update Role',
                        },
                        url: '/api/dashboard/roles/update-role',
                    },
                    {
                        title: {
                            ar: 'حذف دور',
                            en: 'Delete Role',
                        },
                        url: '/api/dashboard/roles/delete-role',
                    },
                    {
                        title: {
                            ar: 'عرض الادوار',
                            en: 'Get Roles',
                        },
                        url: '/api/dashboard/roles/get-all-roles',
                    },
                    {
                        title: {
                            ar: 'عرض دور',
                            en: 'Get Role',
                        },
                        url: '/api/dashboard/roles/get-role/:id',
                    },
                    {
                        title: {
                            ar: 'اضافة صلاحيات',
                            en: 'Add Permissions',
                        },
                        url: '/api/dashboard/roles/add-permissions-to-role',
                    },
                    {
                        title: {
                            ar: 'حذف صلاحيات',
                            en: 'Delete Permissions',
                        },
                        url: '/api/dashboard/roles/delete-permissions-from-role',
                    },
                ],
            },
            {
                id: '2',
                title: {
                    ar: 'المدراء',
                    en: 'admins',
                },
                children: [
                    {
                        title: {
                            ar: 'اضافة مدير',
                            en: 'Add Admin',
                        },
                        url: '/api/dashboard/admins/add-admin',
                    },
                    {
                        title: {
                            ar: 'تعديل مدير',
                            en: 'Update Admin',
                        },
                        url: '/api/dashboard/admins/update-admin',
                    },
                    {
                        title: {
                            ar: 'حذف مدير',
                            en: 'Delete Admin',
                        },
                        url: '/api/dashboard/admins/delete-admin',
                    },
                    {
                        title: {
                            ar: 'عرض المدراء',
                            en: 'Get Admins',
                        },
                        url: '/api/dashboard/admins/get-all-admins',
                    },
                    {
                        title: {
                            ar: 'عرض مدير',
                            en: 'Get Admin',
                        },
                        url: '/api/dashboard/admins/get-admin/:id',
                    },
                    {
                        title: {
                            ar: 'حظر/إلغاء حظر مدير',
                            en: 'Block/Unblock Admin',
                        },
                        url: '/api/dashboard/admins/toggle-block-admin',
                    },
                ],
            },
        ];
    }
}
