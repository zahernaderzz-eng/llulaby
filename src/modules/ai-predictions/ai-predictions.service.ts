import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { ChildrenService } from '../children/children.service';

import * as ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { PassThrough } from 'stream';

ffmpeg.setFfmpegPath(ffmpegPath as string);

@Injectable()
export class AiPredictionsService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly childrenService: ChildrenService,
    ) { }

    // تحويل الصوت إلى wav
    async convertToWav(buffer: Buffer): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const inputStream = new PassThrough();
            inputStream.end(buffer);

            const outputStream = new PassThrough();
            const chunks: Buffer[] = [];

            outputStream.on('data', (chunk) => chunks.push(chunk));
            outputStream.on('end', () => resolve(Buffer.concat(chunks)));
            outputStream.on('error', reject);

            ffmpeg(inputStream)
                .audioChannels(1)
                .audioFrequency(22050)
                .format('wav')
                .on('error', (err) => reject(err))
                .pipe(outputStream);
        });
    }

    async predict(file: Express.Multer.File, userId: string) {
        try {
            // تحويل الصوت إلى wav
            const wavBuffer = await this.convertToWav(file.buffer);

            const formData = new FormData();
            formData.append('file', wavBuffer, {
                filename: 'audio.wav',
                contentType: 'audio/wav',
            });

            const aiServiceUrl =
                this.configService.get<string>('AI_SERVICE_URL') ||
                'http://63.179.148.169/ai/predict';

            const response = await firstValueFrom(
                this.httpService.post(aiServiceUrl, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                }),
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
            console.error(
                'AI Service Error:',
                error.response?.data || error.message,
            );

            throw new InternalServerErrorException(
                'Failed to get prediction from AI service',
            );
        }
    }
}