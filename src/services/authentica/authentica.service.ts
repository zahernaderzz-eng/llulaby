import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthenticaService {
    constructor(private readonly configService: ConfigService) {}

    async sendOtpSms(phone: string, otp: string) {
        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

            const requestData = {
                method: 'sms',
                phone: formattedPhone,
                template_id: 31,
                fallback_email: this.configService.get<string>('EMAIL_USER'),
                otp: otp,
            };

            await axios.post(
                'https://api.authentica.sa/api/v2/send-otp',
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Authorization':
                            this.configService.get<string>(
                                'AUTHENTICA_API_KEY',
                            ),
                    },
                    timeout: 10000,
                },
            );
        } catch (error) {
            console.log(error);
        }
    }
}
