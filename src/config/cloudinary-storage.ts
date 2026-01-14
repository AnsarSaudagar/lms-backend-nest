import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const CloudinaryStorageConfig = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'nestjs-uploads',
    format: file.mimetype.split('/')[1], // jpg, png, webp
    public_id: file.originalname.split('.')[0],
  }),
});
