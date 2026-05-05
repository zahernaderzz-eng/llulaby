import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AudioProcessorService {
    private readonly logger = new Logger(AudioProcessorService.name);
    private readonly uploadDir: string;

    constructor(private configService: ConfigService) {
        this.uploadDir =
            this.configService.get<string>('AI_AUDIO_UPLOAD_DIR') ||
            path.join(process.cwd(), 'uploads/ai-audio');

        this.ensureUploadDir();
    }

    private ensureUploadDir() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            this.logger.log(`Created upload dir: ${this.uploadDir}`);
        }
    }

    getUploadPath(): string {
        return this.uploadDir;
    }

    generateFileName(originalName: string): string {
        const ext = path.extname(originalName);
        return `audio_${Date.now()}${ext}`;
    }

    deleteTempFile(filePath: string): void {
        if (!filePath) return;

        fs.unlink(filePath, (err) => {
            if (err) {
                this.logger.warn(`Failed to delete: ${filePath}`);
            } else {
                this.logger.log(`Deleted temp file: ${filePath}`);
            }
        });
    }
}
