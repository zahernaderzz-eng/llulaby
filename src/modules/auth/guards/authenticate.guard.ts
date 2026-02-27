import {
    CanActivate,
    ExecutionContext,
    Injectable,
    mixin,
    Type,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppException } from 'src/common/exceptions/app.exception';
import { IdentitiesService } from 'src/modules/identities/identities.service';
import { UserTokensService } from 'src/modules/user-tokens/user-tokens.service';

export const AuthenticateGuardFactory = (
    allowNotCompleteData = false,
): Type<CanActivate> => {
    @Injectable()
    class AuthenticateGuard implements CanActivate {
        constructor(
            private readonly identityService: IdentitiesService,
            private readonly tokensService: UserTokensService,
            private readonly jwtService: JwtService,
            private readonly i18n: I18nService,
        ) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest<Request>();
            const token = request.headers['authorization']?.split(' ')[1];

            if (!token) {
                throw new AppException(
                    this.i18n.t('messages.unauthorized'),
                    401,
                );
            }

            let payload: any;

            try {
                payload = await this.jwtService.verifyAsync(token);
            } catch {
                throw new AppException(
                    this.i18n.t('messages.unauthorized'),
                    401,
                );
            }

            const user = await this.identityService.findById(payload.id);

            const authFailed =
                !user ||
                user.status !== 'active' ||
                !user.isVerified ||
                (!allowNotCompleteData && !user.dataCompleted);

            if (authFailed) {
                await this.tokensService.deleteOne({
                    user: payload.id,
                    token,
                });

                throw new AppException(
                    this.i18n.t('messages.unauthorized'),
                    401,
                );
            }

            const tokenExists = await this.tokensService.findOne({
                user: user.id,
                token,
            });

            if (!tokenExists) {
                throw new AppException(
                    this.i18n.t('messages.unauthorized'),
                    401,
                );
            }

            request['user'] = user;
            return true;
        }
    }

    return mixin(AuthenticateGuard);
};
