import fs from 'fs';

export class FileUtil {
    static deleteFile(path: string) {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    }
}
