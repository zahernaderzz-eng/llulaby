import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IdentitiesService } from '../identities/identities.service';
import { UsersService } from '../users/users.service';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class DashboardUsersService {
    constructor(
        private readonly i18nService: I18nService,
        private readonly identitiesService: IdentitiesService,
        private readonly usersService: UsersService,
        private readonly returnObject: ReturnObject,
    ) {}
}
