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

    getChildAvatar(avatar: string | null) {
        return avatar === '' || avatar === null
            ? this.sharedVariables.ADDRESS +
                  this.sharedVariables.CHILDREN_AVATAR_IMAGES +
                  'default.png'
            : avatar.startsWith('http')
              ? avatar
              : this.sharedVariables.ADDRESS +
                this.sharedVariables.CHILDREN_AVATAR_IMAGES +
                avatar;
    }

    child(child: any) {
        if (!child) return null;
        return {
            id: child._id,
            name: child.name,
            dateBirth: child.dateBirth,
            gender: child.gender,
            avatar: this.getChildAvatar(child.avatar),
            height: child.height || null,
            weight: child.weight || null,
            bloodType: child.bloodType || null,
            predictions: child.predictions || [],
        };
    }

    childVaccine(childVaccine: any) {
        return {
            id: childVaccine._id,
            child: this.child(childVaccine.child),
            vaccine: childVaccine.vaccine,
            isTaken: childVaccine.isTaken,
            scheduledDate: childVaccine.scheduledDate,
            takenAt: childVaccine.takenAt,
        };
    }

    childVaccineDetails(childVaccine: any) {
        let vaccineObj: any = null;
        if (childVaccine.vaccineData && childVaccine.vaccineData.length > 0) {
            const v = childVaccine.vaccineData[0];
            vaccineObj = {
                id: v._id,
                name: v.name,
                ageRequired: v.ageRequired,
                dose: v.dose,
                vaccineType: v.vaccineType,
                description: v.description,
                repeat: v.repeat,
            };
        } else if (childVaccine.vaccine && childVaccine.vaccine._id) {
            vaccineObj = {
                id: childVaccine.vaccine._id,
                name: childVaccine.vaccine.name,
                ageRequired: childVaccine.vaccine.ageRequired,
                dose: childVaccine.vaccine.dose,
                vaccineType: childVaccine.vaccine.vaccineType,
                description: childVaccine.vaccine.description,
                repeat: childVaccine.vaccine.repeat,
            };
        }

        return {
            id: childVaccine._id,
            isTaken: childVaccine.isTaken,
            status: childVaccine.status,
            scheduledDate: childVaccine.scheduledDate,
            vaccine: vaccineObj,
        };
    }

    physicalGrowth(physicalGrowth: any, lang: string = 'en') {
        return {
            minMonth: physicalGrowth.minMonth,
            maxMonth: physicalGrowth.maxMonth,
            overview: physicalGrowth.overview[lang],
            weight: physicalGrowth.weight[lang],
            height: physicalGrowth.height[lang],
        };
    }

    motorDevelopment(motorDevelopment: any, lang: string = 'en') {
        return {
            minMonth: motorDevelopment.minMonth,
            maxMonth: motorDevelopment.maxMonth,
            overview: motorDevelopment.overview[lang],
            movement: motorDevelopment.movements.map((m: any) => m[lang]),
        };
    }

    feeding(feeding: any, lang: string = 'en') {
        return {
            minMonth: feeding.minMonth,
            maxMonth: feeding.maxMonth,
            overview: feeding.overview[lang],

            foods: feeding.foods.map((f: any) => ({
                category: f.category[lang],
                items: f.items.map((i: any) => i[lang]),
            })),

            notes: feeding.notes.map((n: any) => n[lang]),
        };
    }
}
