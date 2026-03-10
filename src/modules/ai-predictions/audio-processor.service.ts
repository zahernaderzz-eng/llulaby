import { Injectable, Logger } from '@nestjs/common';
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

    /**
     * Converts uploaded audio to 22050Hz mono WAV
     * This is ALL NestJS does to the audio — Python handles the rest
     */
    async normalizeAudio(inputPath: string): Promise<string> {
        const outputPath = path.join(
            os.tmpdir(),
            `normalized_${Date.now()}.wav`,
        );

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioFrequency(22050) // match model's SAMPLE_RATE exactly
                .audioChannels(1) // mono
                .audioCodec('pcm_s16le') // 16-bit PCM — standard WAV
                .format('wav')
                .on('start', (cmd: string) => {
                    this.logger.debug(`ffmpeg started: ${cmd}`);
                })
                .on('end', () => {
                    this.logger.log(`Normalized audio saved: ${outputPath}`);
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
     * Validates audio file before sending to Python
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
                        error: 'Audio too short — minimum 1 second',
                    });
                    return;
                }

                if (duration > 15) {
                    resolve({
                        isValid: false,
                        durationSeconds: duration,
                        error: 'Audio too long — maximum 15 seconds',
                    });
                    return;
                }

                resolve({ isValid: true, durationSeconds: duration });
            });
        });
    }

    deleteTempFile(filePath: string): void {
        if (!filePath) return;
        fs.unlink(filePath, (err) => {
            if (err)
                this.logger.warn(`Could not delete temp file: ${filePath}`);
        });
    }
}
