import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiPredictionsService } from './ai-predictions.service';

@Controller('ai-predictions')
export class AiPredictionsController {
    constructor(private readonly aiPredictionsService: AiPredictionsService) { }

    @Post('predict')
    @UseInterceptors(FileInterceptor('file'))
    async predict(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Check mimetype to ensure it's a wav file
        // Note: Some clients might send 'audio/x-wav' or 'audio/wave'
        const allowedMimeTypes = ['audio/wav', 'audio/x-wav', 'audio/wave', 'application/octet-stream'];
        if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.endsWith('.wav')) {
            throw new BadRequestException('Only .wav files are allowed');
        }

        return this.aiPredictionsService.predict(file);
    }
}
