import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileManagementService {
    private baseUploadPath = join(__dirname, '../../../uploads');

    private getTodayFolder(): string {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    private ensureUploadFolder(): string {
        const folderName = this.getTodayFolder();
        const uploadPath = join(this.baseUploadPath, folderName);

        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }

        return uploadPath;
    }

    private saveFileToDisk(folder: string, file: Express.Multer.File): { filename: string; path: string } {
        const uploadPath = this.ensureUploadFolder();
        const ext = file.originalname.split('.').pop();
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const todayFolder = this.getTodayFolder();
        const fullPath = join(uploadPath, filename);
        const data = file.buffer ?? readFileSync(file.path)

        writeFileSync(fullPath, data);

        return {
            filename,
            path: `/uploads/${todayFolder}/${filename}`,
        };
    }

    async saveFile(folder: string, file: Express.Multer.File) {
        if (!file) {
            throw new InternalServerErrorException('No file provided');
        }

        const { filename, path } = this.saveFileToDisk(folder, file);

        return {
            message: 'Image uploaded successfully',
            filename,
            folder: this.getTodayFolder(),
            path,
        };
    }

    async saveFiles(folder: string, files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new InternalServerErrorException('No files provided');
        }

        const results = files.map((file) => this.saveFileToDisk(folder, file));

        return {
            message: 'Images uploaded successfully',
            folder: this.getTodayFolder(),
            count: results.length,
            files: results,
        };
    }
}
