import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AdminSigninDto } from './dto/admin-signin.dto';
import { JwtService } from '@nestjs/jwt';
import { AppException } from 'src/common/exceptions/app.exception';
import { IdentitiesService } from '../identities/identities.service';

@Injectable()
export class AdminsAuthService {
    constructor(
        private readonly i18nService: I18nService,
        private readonly identitiesService: IdentitiesService,
        private readonly jwtService: JwtService,
    ) {}

    async signin(data: AdminSigninDto) {
        const admin = await this.identitiesService.findOne(
            { email: data.email, status: 'active' },
            { populate: 'admin', lean: false },
        );

        if (!admin || !(await (admin as any).comparePassword(data.password))) {
            throw new AppException(
                this.i18nService.t('messages.invalidCredentials'),
                401,
            );
        }

        return this.jwtService.signAsync({
            id: admin.id,
            userType: 'admin',
        });
    }
}
