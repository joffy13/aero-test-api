import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { File } from './entities/file.entity';
import { GetUserFiles } from './dto/get-user-files.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: string,
  ): Promise<File> {
    return this.fileService.upload(file, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list(@UserId() userId: string, @Query() query: GetUserFiles) {
    return this.fileService.listUploads(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    await this.fileService.deleteFileById(id);
    return { message: 'File deleted successfully' };
  }
}
