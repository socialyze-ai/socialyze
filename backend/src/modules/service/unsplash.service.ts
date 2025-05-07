import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { GetImagesDto } from '../media/dto/getImages.dto';
import { Readable } from 'stream';

@Injectable()
export class UnsplashService {
  constructor() {}

  async getImages(getImagesDto: GetImagesDto) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    try {
      const isSearch = !!getImagesDto.search;
      const url = isSearch
        ? 'https://api.unsplash.com/search/photos'
        : 'https://api.unsplash.com/photos';

      console.log(url, {
        ...(isSearch ? { query: getImagesDto.search } : {}),
        page: getImagesDto.page,
        per_page: getImagesDto.limit,
        order_by: getImagesDto.order,
      });

      const response = await axios.get(url, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        params: {
          ...(isSearch ? { query: getImagesDto.search } : {}),
          page: getImagesDto.page,
          per_page: getImagesDto.limit,
          order_by: getImagesDto.order,
        },
      });

      const rawImages = isSearch ? response.data.results : response.data;

      const transformedResponse = {
        media: rawImages.map((item: any) => ({
          url: item.urls?.raw,
          download_location: item.links?.download_location,
          username: item.user?.name,
          profile_url: item.user?.links?.html,
          alt_description: item.alt_description,
          width: item.width,
          height: item.height,
        })),
        unsplash_url: `https://unsplash.com/?utm_source=${process.env.UNSPLASH_APP_ID}&utm_medium=referral`,
        page: getImagesDto.page,
        limit: getImagesDto.limit,
      };

      return transformedResponse;
    } catch (error) {
      return {
        error: 'Failed to fetch photos from Unsplash',
        details: error.response?.data || error.message,
      };
    }
  }

  async downloadMedia(url: string): Promise<Express.Multer.File> {
    try {
      const trackDownload = await axios.get(
        `${url}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
      );

      const downloadUrl = trackDownload.data.url;
      console.log('1', trackDownload.data);

      const mediaResponse = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(mediaResponse.data);
      const mimetype = mediaResponse.headers['content-type'] || 'image/jpeg';
      const originalname = `unsplash-media.${mimetype.split('/')[1] || 'jpg'}`;

      return {
        fieldname: 'file',
        originalname,
        encoding: '7bit',
        mimetype,
        size: buffer.length,
        buffer,
        stream: Readable.from(buffer),
        destination: '',
        filename: originalname,
        path: '',
      };
    } catch (error) {
      console.error('Failed to download media from Unsplash:', error);
      throw new InternalServerErrorException(
        'Failed to download media from Unsplash',
      );
    }
  }
}
