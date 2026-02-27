import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage, MulterError } from 'multer';

const options: MulterOptions = {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            return cb(new MulterError('LIMIT_UNEXPECTED_FILE'), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 1024 * 1024 * 5 },
};

export const avatarInterceptor = FileInterceptor('avatar', options);
