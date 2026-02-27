import { SharedVariables } from '../shared-variables/shared-variables';
import { Injectable } from '@nestjs/common';
import { CountryDocument } from 'src/modules/countries/entities/country.entity';

@Injectable()
export class ReturnObject {
    constructor(private readonly sharedVariables: SharedVariables) {}

    getUserAvatar(avatar: string | null) {
        return avatar === '' || avatar === null
            ? this.sharedVariables.ADDRESS +
                  this.sharedVariables.USER_AVATAR_IMAGES +
                  'default.png'
            : avatar.startsWith('https')
              ? avatar
              : this.sharedVariables.ADDRESS +
                this.sharedVariables.USER_AVATAR_IMAGES +
                avatar;
    }

    getAdminAvatar(avatar: string | null) {
        return avatar === '' || avatar === null
            ? this.sharedVariables.ADDRESS +
                  this.sharedVariables.ADMIN_AVATAR_IMAGES +
                  'default.png'
            : avatar.startsWith('https')
              ? avatar
              : this.sharedVariables.ADDRESS +
                this.sharedVariables.ADMIN_AVATAR_IMAGES +
                avatar;
    }

    getCountryImage(image: string) {
        return (
            this.sharedVariables.ADDRESS +
            this.sharedVariables.COUNTRY_IMAGES +
            image
        );
    }

    user(user: any, identity: any) {
        return {
            id: identity._id,
            name: user.name,
            email: identity.email,
            phone: identity.phone,
            avatar: this.getUserAvatar(user.avatar),
            country: user.country
                ? this.country(user.country as CountryDocument)
                : null,
        };
    }

    country(country: any) {
        return {
            id: country._id,
            name: country.name,
            image: this.getCountryImage(country.image),
        };
    }

    userProfile(user: any, identity: any) {
        return {
            id: identity._id,
            name: user.name,
            avatar: this.getUserAvatar(user.avatar),
            country: user.country
                ? this.country(user.country as CountryDocument)
                : null,
            bio: user.bio || '',
            notificationsCount: user.notificationsCount,
        };
    }

    role(role: any) {
        return {
            id: role._id,
            name: role.name,
            permissions: role.permissions,
        };
    }

    admin(admin: any, identity: any) {
        return {
            id: identity._id,
            name: admin.name,
            email: identity.email,
            phone: identity.phone,
            status: identity.status,
            isSuperAdmin: identity.isSuperAdmin,
            role: this.role(identity.role),
            avatar: this.getAdminAvatar(admin.avatar),
        };
    }
}
