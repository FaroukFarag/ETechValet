import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { MemoryStoredFile } from 'nestjs-form-data';

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

  private ensureFolder(folder?: string): string {
    const folderName = folder || this.getTodayFolder();
    const uploadPath = join(this.baseUploadPath, folderName);

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    return uploadPath;
  }

  private saveFileToDisk(file: MemoryStoredFile, folder?: string): { filename: string; path: string } {
    if (!file || !file.buffer) {
      throw new InternalServerErrorException('File buffer is empty');
    }

    const todayFolder = folder || this.getTodayFolder();
    const uploadPath = this.ensureFolder(todayFolder);

    const ext = file.originalName.split('.').pop() || 'bin';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const fullPath = join(uploadPath, filename);

    writeFileSync(fullPath, file.buffer);

    return {
      filename,
      path: `/uploads/${todayFolder}/${filename}`,
    };
  }

  async saveFile(file: MemoryStoredFile, folder?: string) {
    const { filename, path } = this.saveFileToDisk(file, folder);
    return {
      message: 'File uploaded successfully',
      filename,
      folder: folder || this.getTodayFolder(),
      path,
    };
  }

  async saveFiles(files: MemoryStoredFile[], folder?: string) {
    if (!files || files.length === 0) {
      throw new InternalServerErrorException('No files provided');
    }

    const results = files.map((file) => this.saveFileToDisk(file, folder));

    return {
      message: 'Files uploaded successfully',
      folder: folder || this.getTodayFolder(),
      count: results.length,
      files: results,
    };
  }
}
