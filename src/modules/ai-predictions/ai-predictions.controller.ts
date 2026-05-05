import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Req,
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';
import { AudioProcessorService } from './audio-processor.service';
import { FastApiClientService } from './fastapi-client.service';
import { ChildrenService } from '../children/children.service';

@Controller('ai-predictions')
export class AiPredictionsController {
    private readonly logger = new Logger(AiPredictionsController.name);

    constructor(
        private readonly audioProcessor: AudioProcessorService,
        private readonly fastApiClient: FastApiClientService,
        private readonly childrenService: ChildrenService,
    ) {}

    @UseGuards(AuthenticateGuardFactory())
    @Post('predict')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    cb(
                        null,
                        process.env.AI_AUDIO_UPLOAD_DIR ||
                            './uploads/ai-audio',
                    );
                },
                filename: (req, file, cb) => {
                    const ext = file.originalname.split('.').pop();
                    cb(null, `audio_${Date.now()}.${ext}`);
                },
            }),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
            },
            fileFilter: (_req, file, cb) => {
                const allowed = [
                    'audio/wav',
                    'audio/wave',
                    'audio/x-wav',
                    'audio/mpeg',
                    'audio/mp3',
                    'audio/mp4',
                    'audio/m4a',
                    'audio/aac',
                    'application/octet-stream',
                ];

                const extension = file.originalname.toLowerCase();

                if (
                    allowed.includes(file.mimetype) ||
                    extension.endsWith('.wav') ||
                    extension.endsWith('.mp3') ||
                    extension.endsWith('.m4a') ||
                    extension.endsWith('.aac')
                ) {
                    cb(null, true);
                } else {
                    cb(
                        new BadRequestException(
                            `Audio files only. Received: ${file.mimetype}`,
                        ),
                        false,
                    );
                }
            },
        }),
    )
    async predict(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('No audio file provided');
        }

        const userId = req['user']['id'];
        const filePath = file.path;

        try {
            this.logger.log(
                `Received audio: ${file.originalname} | ${file.size} bytes | user: ${userId}`,
            );

            // Send directly to FastAPI
            const result = await this.fastApiClient.predict(filePath);

            // Save to DB
            const dbPrediction =
                result.prediction || result.predicted_label || 'unknown';

            const dbConfidence =
                typeof result.confidence === 'number' ? result.confidence : 1.0;

            await this.childrenService.addPrediction(
                userId,
                dbPrediction,
                dbConfidence,
            );

            return {
                success: true,
                ...result,
            };
        } catch (err: any) {
            this.logger.error(`Predict failed: ${err?.message}`);

            if (err?.status) throw err;

            const detail = err?.response?.data?.detail ?? 'Prediction failed';

            throw new InternalServerErrorException(detail);
        } finally {
            // Cleanup temp file
            if (filePath) {
                this.audioProcessor.deleteTempFile(filePath);
            }
        }
    }
}
