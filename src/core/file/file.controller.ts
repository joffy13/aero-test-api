import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
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
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiFile } from 'src/common/decorators/api-file-decorator';

@ApiBearerAuth()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiFile()
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
  @Get('/:id')
  async info(@Param('id') id: string) {
    return this.fileService.getFileById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    await this.fileService.deleteFileById(id);
    return { message: 'File deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const path = await this.fileService.downloadFile(id);
    res.download(path);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiFile()
  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.updateFile(id, file);
  }
}
