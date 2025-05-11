import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class CommonService {
  constructor() {}

  makeId(length: number) {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  async downloadMedia(url: string): Promise<Express.Multer.File> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const mediaBuffer = Buffer.from(response.data, 'binary');
    const contentType =
      response.headers['content-type'] || 'application/octet-stream';
    const fileExtension = contentType.split('/')[1] || 'bin';
    const originalname = `media.${fileExtension}`;
    const fakeFilename = `${randomUUID()}.${fileExtension}`;

    return {
      fieldname: 'file',
      originalname,
      encoding: '7bit',
      mimetype: contentType,
      size: mediaBuffer.length,
      buffer: mediaBuffer,
      stream: Readable.from(mediaBuffer),
      destination: '/tmp',
      filename: fakeFilename,
      path: `/tmp/${fakeFilename}`,
    };
  }
}
