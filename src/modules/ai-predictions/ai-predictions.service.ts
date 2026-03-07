import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { ChildrenService } from '../children/children.service';

import ffmpeg from 'fluent-ffmpeg';
const ffmpegPath = require('ffmpeg-static');

import { PassThrough } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);

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

    private async saveFileLocally(buffer: Buffer, filename: string): Promise<string> {
        const uploadDir = path.join(process.cwd(), 'uploads', 'ai-debug');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        console.log(`Audio saved locally at: ${filePath}`);
        return filePath;
    }

    async predict(file: Express.Multer.File, userId: string) {
        try {
            // تحويل الصوت إلى wav
            const wavBuffer = await this.convertToWav(file.buffer);

            // حفظ الملف محلياً للتجربة
            const timestamp = new Date().getTime();
            const debugFilename = `debug_${userId}_${timestamp}.wav`;
            await this.saveFileLocally(wavBuffer, debugFilename);

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