import {
    Controller, Post, UseInterceptors, UploadedFile,
    UseGuards, Req, BadRequestException,
    InternalServerErrorException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as os from 'os';
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
    ) { }

    @UseGuards(AuthenticateGuardFactory())
    @Post('predict')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: os.tmpdir(),
                filename: (_req, _file, cb) => {
                    cb(null, `upload_${Date.now()}.wav`);
                },
            }),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB max raw input
            },
            fileFilter: (_req, file, cb) => {
                const allowed = [
                    'audio/wav', 'audio/wave', 'audio/x-wav',
                    'audio/mpeg', 'audio/mp3', 'audio/mp4',
                    'application/octet-stream' // Often used by mobile apps
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
                    cb(new BadRequestException(`Audio files only (.wav, .mp3, .m4a). Received: ${file.mimetype}`), false);
                }
            },
        }),
    )
    async predict(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
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

            // ── Step 1: Validate duration ──────────────────
            const validation = await this.audioProcessor.validateAudioFile(rawPath);

            if (!validation.isValid) {
                throw new BadRequestException(validation.error);
            }

            this.logger.log(`Audio duration: ${validation.durationSeconds.toFixed(2)}s`);

            // ── Step 2: Normalize to 22050Hz mono WAV ──────
            normalizedPath = await this.audioProcessor.normalizeAudio(rawPath);

            // ── Step 3: Send normalized file to FastAPI ────
            const result = await this.fastApiClient.predict(normalizedPath);

            // ── Step 4: Save to database ───────
            await this.childrenService.addPrediction(
                userId,
                result.prediction,
                result.confidence,
            );

            return {
                success: true,
                prediction: result.prediction,
                confidence: result.confidence,
            };

        } catch (err: any) {
            this.logger.error(`Predict failed: ${err?.message}`);

            // Re-throw NestJS HTTP exceptions as-is
            if (err?.status) throw err;

            // FastAPI error — forward the detail message
            const detail = err?.response?.data?.detail ?? 'Prediction failed';
            throw new InternalServerErrorException(detail);

        } finally {
            // Always clean up temp files
            if (rawPath) this.audioProcessor.deleteTempFile(rawPath);
            if (normalizedPath) this.audioProcessor.deleteTempFile(normalizedPath);
        }
    }
}
