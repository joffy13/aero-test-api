import { Module } from '@nestjs/common';
import { AuthModule } from './core/auth/auth.module';
import typeormConfig from './common/config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from './core/file/file.module';
import { UserModule } from './core/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    AuthModule,
    FileModule,
    UserModule,
    TypeOrmModule.forRoot(typeormConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
})
export class AppModule {}
