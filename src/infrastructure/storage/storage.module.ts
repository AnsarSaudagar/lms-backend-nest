import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

/**
 * Configures Cloudinary-backed multer storage. Modules that import this
 * can use FileInterceptor without passing an explicit `storage` option.
 */
@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        cloudinary.config({
          cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
          api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
          api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
        });

        return {
          storage: new CloudinaryStorage({
            cloudinary,
            params: async (req, file) => ({
              folder: 'nestjs-uploads',
              format: file.mimetype.split('/')[1],
              public_id: file.originalname.split('.')[0],
            }),
          }),
        };
      },
    }),
  ],
  exports: [MulterModule],
})
export class StorageModule {}
