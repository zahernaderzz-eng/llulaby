import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppException } from 'src/common/exceptions/app.exception';
import { IdentitiesService } from 'src/modules/identities/identities.service';

@Injectable()
export class AdminAuthenticateGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly i18n: I18nService,
        private readonly identitiesService: IdentitiesService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        const token = request.headers['authorization']?.split(' ')[1];

        if (!token) {
            throw new AppException(this.i18n.t('messages.unauthorized'), 401);
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            const identity = await this.identitiesService.findById(payload.id, {
                populate: ['role'],
                lean: true,
            });

            if (!identity || identity.status !== 'active') {
                throw new AppException(
                    this.i18n.t('messages.unauthorized'),
                    401,
                );
            }

            request['admin'] = identity;

            return true;
        } catch (error) {
            console.log(error);
            throw new AppException(this.i18n.t('messages.unauthorized'), 401);
        }
    }
}
