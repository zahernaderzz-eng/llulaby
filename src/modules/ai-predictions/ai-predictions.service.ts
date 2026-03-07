import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class AiPredictionsService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async predict(file: Express.Multer.File) {
        const formData = new FormData();
        formData.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://63.179.148.169/ai/predict';

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    aiServiceUrl,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                        },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            console.error('AI Service Error:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to get prediction from AI service');
        }
    }
}
