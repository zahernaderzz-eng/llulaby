import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { ChildrenService } from '../children/children.service';

@Injectable()
export class AiPredictionsService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly childrenService: ChildrenService,
    ) { }

    async predict(file: Express.Multer.File, userId: string) {
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

            const result = response.data;
            if (result && result.success) {
                await this.childrenService.addPrediction(
                    userId,
                    result.prediction,
                    result.confidence,
                );
            }

            return result;
        } catch (error) {
            console.error('AI Service Error:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to get prediction from AI service');
        }
    }
}
