import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export class ImageUtil {
    private static baseUploadPath = path.resolve(
        process.cwd(),
        'public',
        'uploads',
    );

    static async processAndSaveAvatar(
        fileBuffer: Buffer,
        type: string,
    ): Promise<string> {
        const filename = `${uuidv4()}.png`;
        const uploadDir = path.join(this.baseUploadPath, type, 'avatars');

        await fs.promises.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);

        await sharp(fileBuffer)
            .resize(400, 400, {
                fit: sharp.fit.cover,
                position: 'center',
            })
            .png()
            .toFile(filePath);

        return filename;
    }

    static getAvatarPath(type: string, avatar: string): string {
        return path.join(this.baseUploadPath, type, 'avatars', avatar);
    }

    static async removeAvatar(
        type: string,
        avatarFilename: string,
    ): Promise<void> {
        if (avatarFilename.includes('..')) return;

        const avatarPath = this.getAvatarPath(type, avatarFilename);

        try {
            await fs.promises.unlink(avatarPath);
        } catch (err: any) {
            // ignore if file doesn't exist
            if (err.code !== 'ENOENT') {
                console.error('Failed to remove avatar:', err);
            }
        }
    }
}
