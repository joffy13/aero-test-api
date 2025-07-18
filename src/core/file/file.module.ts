import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { File } from './entities/file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalUploadStrategy } from './strategies/local-upload-strategy';

@Module({
  controllers: [FileController],
  providers: [
    FileService,
    { provide: 'FileUploader', useClass: LocalUploadStrategy },
  ],
  imports: [TypeOrmModule.forFeature([File])],
})
export class FileModule {}
