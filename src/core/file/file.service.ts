import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFileUploader } from './file.types';
import * as path from 'path';
import { GetUserFiles } from './dto/get-user-files.dto';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    @Inject('FileUploader') private fileUploader: IFileUploader,
  ) {}

  async upload(file: Express.Multer.File, userId: string) {
    const uploadResponse = await this.fileUploader.upload(file);
    const parsed = path.parse(file.originalname);
    const upload = this.fileRepository.create({
      name: parsed.name,
      extension: parsed.ext.slice(1),
      url: uploadResponse.url,
      path: uploadResponse.path || '',
      mimeType: file.mimetype,
      size: file.size,
      userId,
    });
    return this.fileRepository.save(upload);
  }

  async listUploads(userId: string, query: GetUserFiles) {
    const { list_size = 10, page = 1 } = query;
    const [items, total] = await this.fileRepository.findAndCount({
      where: { userId: userId },
      order: { uploadedAt: 'DESC' },
      take: list_size,
      skip: (page - 1) * list_size,
    });

    return {
      total,
      page,
      list_size,
      items,
    };
  }

  async deleteFileById(id: string) {
    const upload = await this.fileRepository.findOne({ where: { id } });
    if (!upload) {
      throw new NotFoundException('File not found');
    }
    await this.fileUploader.delete(upload.url);

    await this.fileRepository.delete(id);
    return;
  }

  async getFileById(id: string) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async downloadFile(id: string) {
    const file = await this.getFileById(id);
    return path.resolve(process.cwd(), file.path);
  }

  async updateFile(id: string, newFile: Express.Multer.File) {
    const existing = await this.getFileById(id);

    await this.fileUploader.delete(existing.url);

    const savedPath = await this.fileUploader.upload(newFile);
    const parsed = path.parse(newFile.originalname);

    existing.name = parsed.name;
    existing.extension = parsed.ext.slice(1);
    existing.mimeType = newFile.mimetype;
    existing.size = newFile.size;
    existing.path = savedPath.path || '';
    existing.url = savedPath.url;

    return this.fileRepository.save(existing);
  }
}
