import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppException } from 'src/common/exceptions/app.exception';
import { RolesService } from 'src/modules/roles/roles.service';

@Injectable()
export class AdminPermissionsGuard implements CanActivate {
    constructor(
        private readonly i18n: I18nService,
        private readonly roleService: RolesService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        const admin = request['admin'];

        if (!admin) {
            throw new AppException(this.i18n.t('messages.notAllowed'), 401);
        }

        const { permissions } = admin.role;

        const url = request.originalUrl;

        let urlWithoutQuery = url.split('?')[0];

        // replace mongodb ids from url with :id
        urlWithoutQuery = urlWithoutQuery.replace(/[0-9a-fA-F]{24}/g, ':id');

        console.log(`Checking permission for URL: ${urlWithoutQuery}`);

        console.log('Permissions:', permissions);

        if (!permissions.includes(urlWithoutQuery)) {
            throw new AppException(this.i18n.t('messages.notAllowed'), 401);
        }

        return true;
    }
}
