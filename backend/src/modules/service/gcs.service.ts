// gcs.service.ts
import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GcsService {
  private storage = new Storage({
    credentials: {
      client_email: process.env.GCS_CLIENT_EMAIL,
      private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    projectId: process.env.GCS_PROJECT_ID,
  });

  private bucketName = process.env.GCS_BUCKET_NAME;

  async uploadMedia(file: Express.Multer.File, foldering: string) {
    const bucket = this.storage.bucket(this.bucketName);
    const filename = `${foldering}/${uuidv4()}_${file.originalname}`;
    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => reject(err));
      blobStream.on('finish', async () => {
        try {
          const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;
          resolve({ url: publicUrl });
        } catch (error) {
          reject(error);
        }
      });
      blobStream.end(file.buffer);
    });
  }
}
