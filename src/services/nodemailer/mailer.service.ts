import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly i18nService: I18nService,
    ) {}

    async sendOtpMail(email: string, otp: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: this.i18nService.t('messages.otpSubject'),
            text: this.i18nService.t('messages.otpBody', { args: { otp } }),
            html: this.i18nService.t('messages.otpHtml', { args: { otp } }),
        });
    }
}
