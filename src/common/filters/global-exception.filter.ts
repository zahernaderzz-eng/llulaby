import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../exceptions/app.exception';
import { I18nService } from 'nestjs-i18n';
import { MulterError } from 'multer';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly i18nService: I18nService) {}

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const errorData: {
            success: false;
            statusCode?: number;
            message?: string;
            key?: string;
            token?: string;
        } = { success: false };

        if (exception instanceof AppException) {
            errorData.statusCode = exception.getStatus();
            errorData.message = exception.message;
            errorData.key = exception.key;
            errorData.token = exception.token;
        } else if (exception instanceof NotFoundException) {
            errorData.statusCode = 404;
            errorData.message = this.i18nService.t('messages.notFound');
        } else if (exception instanceof MulterError) {
            errorData.statusCode = 400;

            switch (exception.code) {
                case 'LIMIT_FILE_SIZE':
                    errorData.message = this.i18nService.t(
                        'messages.fileTooLarge',
                    );
                    break;
                case 'LIMIT_UNEXPECTED_FILE':
                    errorData.message = this.i18nService.t(
                        'messages.invalidFile',
                    );
                    break;
                default:
                    errorData.message = this.i18nService.t(
                        'messages.invalidFile',
                    );
                    break;
            }
        } else if (
            exception instanceof BadRequestException &&
            (exception.message === 'Unexpected field' ||
                (typeof exception.getResponse === 'function' &&
                    (exception.getResponse() as any)?.message ===
                        'Unexpected field'))
        ) {
            errorData.statusCode = 400;
            errorData.message = this.i18nService.t('messages.invalidFile');
        } else {
            console.error('Unhandled Exception:', exception);

            errorData.statusCode = 500;
            errorData.message = this.i18nService.t('messages.internalError');
        }

        response.status(errorData.statusCode).json(errorData);
    }
}
