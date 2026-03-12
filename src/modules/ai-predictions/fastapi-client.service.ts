import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
const FormData = require('form-data');
import * as fs from 'fs';

export interface PredictionResult {
    prediction: string;    // e.g. "belly_pain"
    confidence?: number;    // e.g. 0.9999
    all_probabilities?: Record<string, number>;
    [key: string]: any;     // Allow for other dynamic fields from the model
}

@Injectable()
export class FastApiClientService {
    private readonly logger = new Logger(FastApiClientService.name);
    private readonly client: AxiosInstance;

    constructor(private configService: ConfigService) {
        let aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://63.179.148.169:8000';

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

        const response = await this.client.post<string>(
            '/predict',
            form,
            {
                headers: form.getHeaders(),
                // Ensure response is treated as text for manual parsing
                responseType: 'text'
            },
        );

        let data = response.data;
        let result: PredictionResult;

        try {
            // Check if it's a JSON string
            const parsed = JSON.parse(data);

            if (typeof parsed === 'object' && parsed !== null) {
                result = parsed as PredictionResult;
                // Ensure prediction field exists or use predicted_label
                if (!result.prediction && result.predicted_label) {
                    result.prediction = result.predicted_label;
                }
            } else {
                // It's a quoted string from JSON.parse
                result = { prediction: String(parsed) };
            }
        } catch (e) {
            // Not JSON, use raw string
            result = { prediction: data.replace(/^"(.*)"$/, '$1') };
        }

        this.logger.log(
            `FastAPI response parsed: ${JSON.stringify(result)}`,
        );

        return result;
    }
}
