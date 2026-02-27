import { Injectable, ValidationPipe } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class AppValidationPipe extends ValidationPipe {
    constructor(private readonly i18nService: I18nService<any>) {
        super({
            transform: true,
            whitelist: true,
            exceptionFactory: (errors) => {
                const firstError = errors[0];
                const message = Object.values(firstError.constraints!)[0];

                throw new AppException(
                    this.i18nService.t(message as never),
                    400,
                );
            },
        });
    }
}
