import { ITokenPayload } from '../interfaces/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserTokensService } from 'src/modules/user-tokens/user-tokens.service';
import { DevicesService } from 'src/modules/devices/devices.service';
import { Injectable } from '@nestjs/common';
import { MailService } from 'src/services/nodemailer/mailer.service';
import { AuthenticaService } from 'src/services/authentica/authentica.service';
import { AuthUtil } from 'src/common/utils/auth-util';
import { IdentitiesService } from 'src/modules/identities/identities.service';

@Injectable()
export class AuthHelper {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userTokensService: UserTokensService,
        private readonly devicesServices: DevicesService,
        private readonly mailerService: MailService,
        private readonly authenticaService: AuthenticaService,
        private readonly identitiesService: IdentitiesService,
    ) {}

    async duplicate(fieldName: string, fieldValue: string, updateId?: string) {
        const query = {
            [fieldName]: fieldValue,
            status: { $ne: 'deleted' },
        };

        if (updateId) query._id = { $ne: updateId };

        const found = await this.identitiesService.findOne(query);

        return found ? true : false;
    }

    async newToken(payload: ITokenPayload) {
        const token = await this.jwtService.signAsync(payload);

        await this.userTokensService.create({ user: payload.id, token });

        return token;
    }

    async newDevice(
        user: string,
        fcmToken: string,
        deviceType: string = 'android',
    ) {
        const exists = await this.devicesServices.findOne({ user, fcmToken });

        if (!exists)
            await this.devicesServices.create({ fcmToken, user, deviceType });
    }

    async getUserByIdentifier(
        identifier: string,
        extraFilters: { [key: string]: any } = {},
    ) {
        const type = AuthUtil.getIdentifierType(identifier);

        if (!type) return null;

        const user = await this.identitiesService.findOne({
            [type]: identifier,
            status: 'active',
            ...extraFilters,
        });

        return user ? user : null;
    }

    async sendOtpWithIdentifier(identifier: string, otp: string) {
        const type = AuthUtil.getIdentifierType(identifier);

        if (!type) return null;

        switch (type) {
            case 'email':
                await this.mailerService.sendOtpMail(identifier, otp);
                break;
            case 'phone':
                await this.authenticaService.sendOtpSms(identifier, otp);
                break;
            default:
                return null;
        }
    }

    async deleteAllUserTokens(userId: string) {
        await this.userTokensService.deleteMany({ user: userId });
    }

    async deleteAllUserDevices(userId: string) {
        await this.devicesServices.deleteMany({ user: userId });
    }
}
