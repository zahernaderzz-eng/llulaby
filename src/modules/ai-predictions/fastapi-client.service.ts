import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
const FormData = require('form-data');
import * as fs from 'fs';

export interface PredictionResult {
    prediction: string;    // e.g. "belly_pain"
    confidence: number;    // e.g. 0.9999
    all_probabilities?: Record<string, number>;
}

@Injectable()
export class FastApiClientService {
    private readonly logger = new Logger(FastApiClientService.name);
    private readonly client: AxiosInstance;

    constructor(private configService: ConfigService) {
        let aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://63.179.148.169/ai';

        // Strip trailing /predict if present to avoid duplication with the post path
        if (aiServiceUrl.endsWith('/predict')) {
            aiServiceUrl = aiServiceUrl.substring(0, aiServiceUrl.length - 8);
        }

        this.client = axios.create({
            baseURL: aiServiceUrl,
            timeout: 30000,
            headers: {
                // Internal service auth — add if your FastAPI is protected
                'X-Internal-Key': this.configService.get<string>('FASTAPI_INTERNAL_KEY') ?? '',
            },
        });
    }

    async predict(normalizedWavPath: string): Promise<PredictionResult> {
        const form = new FormData();

        form.append('file', fs.createReadStream(normalizedWavPath), {
            filename: 'cry.wav',
            contentType: 'audio/wav',
        });

        this.logger.log(`Sending to FastAPI: ${normalizedWavPath}`);

        const response = await this.client.post<PredictionResult>(
            '/predict',
            form,
            { headers: form.getHeaders() },
        );

        this.logger.log(
            `FastAPI response: ${response.data.prediction} (${response.data.confidence})`,
        );

        return response.data;
    }
}
