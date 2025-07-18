import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
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
    const upload = this.fileRepository.create({
      name: path.parse(file.originalname).name,
      url: uploadResponse.url,
      path: uploadResponse.path,
      mimeType: file.mimetype,
      extension: path.parse(file.originalname).ext.slice(1),
      size: file.size,
      userId,
    });
    return this.fileRepository.save(upload);
  }

  async listUploads(userId: string, query: GetUserFiles) {
    const { list_size = 10, page = 1 } = query;
    console.log(userId);
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
    await this.fileUploader.delete(upload.path);

    await this.fileRepository.delete(id);
    return;
  }
}
