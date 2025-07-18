import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IFileUploader, IFileUploadeResponse } from '../file.types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class LocalUploadStrategy implements IFileUploader {
  private uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor(private configService: ConfigService) {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<IFileUploadeResponse> {
    const APP_URL = this.configService.get('APP_URL');
    if (!file || !file.buffer || !file.originalname) {
      throw new BadRequestException('Invalid file upload');
    }

    const fileName = `${randomUUID()}_${file.originalname}`;
    const fullPath = path.join(this.uploadDir, fileName);

    try {
      await fs.writeFile(fullPath, file.buffer);
      return {
        url: `${APP_URL}/uploads/${fileName}`,
        path: `uploads/${fileName}`,
      };
    } catch (err) {
      console.error('File write error:', err);
      throw new InternalServerErrorException('Failed to save file');
    }
  }
  async delete(url: string): Promise<void> {
    try {
      await fs.unlink(url);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new InternalServerErrorException(
          'Failed to delete file from disk',
        );
      }
    }
  }
}
