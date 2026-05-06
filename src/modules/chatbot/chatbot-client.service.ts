import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface ChatbotRequest {
    question: string;
    age?: number;
    language: string;
    session_id: string;
}

export interface ChatbotResponse {
    answer: string;
    session_id: string;
}

@Injectable()
export class ChatbotClientService {
    private readonly logger = new Logger(ChatbotClientService.name);
    private readonly client: AxiosInstance;

    constructor(private configService: ConfigService) {
        const chatbotServiceUrl =
            this.configService.get<string>('CHATBOT_SERVICE_URL') ||
            'http://63.179.148.169:8001';

        this.client = axios.create({
            baseURL: chatbotServiceUrl,
            timeout: 30000,
        });
    }

    async ask(request: ChatbotRequest): Promise<ChatbotResponse> {
        this.logger.log(
            `Sending question to chatbot: "${request.question}" | session: ${request.session_id}`,
        );

        const response = await this.client.post<ChatbotResponse>(
            '/ask',
            request,
        );

        this.logger.log(
            `Chatbot response: ${response.data.answer.substring(0, 100)}...`,
        );

        return response.data;
    }

    async clearMemory(sessionId: string): Promise<void> {
        this.logger.log(`Clearing memory for session: ${sessionId}`);

        await this.client.delete(`/memory/${sessionId}`);

        this.logger.log(`Memory cleared for session: ${sessionId}`);
    }
}
