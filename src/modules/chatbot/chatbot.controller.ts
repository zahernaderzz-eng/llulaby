import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';
import { ChatbotClientService } from './chatbot-client.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { detectLanguage } from '../../common/utils/language-detector.util';

@Controller('chatbot')
export class ChatbotController {
    private readonly logger = new Logger(ChatbotController.name);

    constructor(private readonly chatbotClient: ChatbotClientService) {}

    @UseGuards(AuthenticateGuardFactory())
    @Post('ask')
    async ask(@Body() dto: AskQuestionDto, @Req() req: any) {
        if (!dto.question || !dto.question.trim()) {
            throw new BadRequestException('Question is required');
        }

        const userId = req['user']['id'];
        const question = dto.question.trim();

        // Auto-detect language if not provided
        const language = dto.language || detectLanguage(question);

        this.logger.log(
            `Question language detected: ${language} | user: ${userId}`,
        );

        try {
            const result = await this.chatbotClient.ask({
                question,
                age: dto.age,
                language,
                session_id: userId,
            });

            return {
                success: true,
                answer: result.answer,
                session_id: result.session_id,
                language, // Return detected language
            };
        } catch (err: any) {
            this.logger.error(`Chatbot ask failed: ${err?.message}`);

            if (err?.status) throw err;

            const detail =
                err?.response?.data?.detail ?? 'Chatbot request failed';

            throw new InternalServerErrorException(detail);
        }
    }

    @UseGuards(AuthenticateGuardFactory())
    @Post('memory')
    async clearMemory(@Req() req: any) {
        const userId = req['user']['id'];

        try {
            await this.chatbotClient.clearMemory(userId);

            return {
                success: true,
                message: 'Chat memory cleared',
            };
        } catch (err: any) {
            this.logger.error(`Clear memory failed: ${err?.message}`);

            throw new InternalServerErrorException('Failed to clear memory');
        }
    }
}
