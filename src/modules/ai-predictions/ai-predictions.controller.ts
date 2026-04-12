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
                        process.env.AI_AUDIO_DEBUG_DIR || './uploads/ai-debug',
                    );
                },
                filename: (req, file, cb) => {
                    cb(null, `debug_${Date.now()}.wav`);
                },
            }),
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
            fileFilter: (_req, file, cb) => {
                const allowed = [
                    'audio/wav',
                    'audio/wave',
                    'audio/x-wav',
                    'audio/mpeg',
                    'audio/mp3',
                    'audio/mp4',
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
                            `Audio files only (.wav, .mp3, .m4a). Received: ${file.mimetype}`,
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
        const rawPath = file.path;
        let normalizedPath: string | null = null;

        try {
            this.logger.log(
                `Received audio: ${file.originalname} | ${file.size} bytes | user: ${userId}`,
            );

            // ✅ Step 1: Validate
            const validation =
                await this.audioProcessor.validateAudioFile(rawPath);

            if (!validation.isValid) {
                throw new BadRequestException(validation.error);
            }

            // ✅ Step 2: Normalize
            normalizedPath = await this.audioProcessor.normalizeAudio(rawPath);

            // ✅ Step 3: Predict
            const result = await this.fastApiClient.predict(normalizedPath);

            // ✅ Step 4: Save to DB
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
            // 🧠 Smart cleanup (بيحترم KEEP_DEBUG_AUDIO)
            if (rawPath) this.audioProcessor.deleteTempFile(rawPath);

            if (normalizedPath)
                this.audioProcessor.deleteTempFile(normalizedPath);
        }
    }
}
