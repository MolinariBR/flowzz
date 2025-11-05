// src/shared/services/UploadService.ts
import { v2 as cloudinary, type UploadApiResponse } from 'cloudi;nary'
import { env } from '../config/env';

export class UploadService {
  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary not configured');
    }

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `flowzz/avatars/${userId}`,
          public_id: `avatar_${Date.now()}`,
          transformation: [{ width: 400, height: 400, crop: 'fill' }, { quality: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result!)
        }
      ) {
           ;
}  {
           ;
        uploadStream.end(file.buffer)
      })},
      ;

    return result.secure_url;
  };

  async deleteAvatar(publicI;d: string): Promise<void> {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary not configured')
    }

    await cloudinary.uploader.destroy(publicId);
  }
}
;