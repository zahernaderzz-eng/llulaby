import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

@Injectable()
export class AudioProcessorService {
    private readonly logger = new Logger(AudioProcessorService.name);
    private readonly debugDir: string;
    private readonly keepDebugAudio: boolean;

    constructor(private configService: ConfigService) {
        this.debugDir =
            this.configService.get<string>('AI_AUDIO_DEBUG_DIR') ||
            path.join(process.cwd(), 'uploads/ai-debug');

        this.keepDebugAudio =
            this.configService.get<string>('KEEP_DEBUG_AUDIO') === 'true';

        this.ensureDebugDir();
    }

    private ensureDebugDir() {
        if (!fs.existsSync(this.debugDir)) {
            fs.mkdirSync(this.debugDir, { recursive: true });
            this.logger.log(`Created debug dir: ${this.debugDir}`);
        }
    }

    /**
     * Get upload destination (for multer)
     */
    getUploadPath(): string {
        return this.debugDir;
    }

    /**
     * Generate debug filename
     */
    generateFileName(prefix = 'debug'): string {
        return `${prefix}_${Date.now()}.wav`;
    }

    /**
     * Normalize audio → 22050Hz mono WAV
     */
    async normalizeAudio(inputPath: string): Promise<string> {
        const outputPath = path.join(
            os.tmpdir(),
            `normalized_${Date.now()}.wav`,
        );

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioFrequency(22050)
                .audioChannels(1)
                .audioCodec('pcm_s16le')
                .format('wav')
                .on('end', () => {
                    this.logger.log(`Normalized audio: ${outputPath}`);
                    resolve(outputPath);
                })
                .on('error', (err: any) => {
                    this.logger.error(`ffmpeg error: ${err.message}`);
                    reject(err);
                })
                .save(outputPath);
        });
    }

    /**
     * Validate duration
     */
    async validateAudioFile(filePath: string): Promise<{
        isValid: boolean;
        durationSeconds: number;
        error?: string;
    }> {
        return new Promise((resolve) => {
            ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
                if (err) {
                    resolve({
                        isValid: false,
                        durationSeconds: 0,
                        error: err.message,
                    });
                    return;
                }

                const duration = metadata.format.duration ?? 0;

                if (duration < 1) {
                    resolve({
                        isValid: false,
                        durationSeconds: duration,
                        error: 'Audio too short',
                    });
                    return;
                }

                if (duration > 15) {
                    resolve({
                        isValid: false,
                        durationSeconds: duration,
                        error: 'Audio too long',
                    });
                    return;
                }

                resolve({ isValid: true, durationSeconds: duration });
            });
        });
    }

    /**
     * Delete temp files safely
     */
    deleteTempFile(filePath: string): void {
        if (!filePath) return;

        // لو ده debug file ومفعل الاحتفاظ → متحذفوش
        if (this.keepDebugAudio && filePath.startsWith(this.debugDir)) {
            this.logger.debug(`Keeping debug file: ${filePath}`);
            return;
        }

        fs.unlink(filePath, (err) => {
            if (err) {
                this.logger.warn(`Failed to delete: ${filePath}`);
            }
        });
    }
}
