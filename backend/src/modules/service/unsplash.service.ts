import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GetImagesDto } from '../media/dto/getImages.dto';
import { UploadMediaDto } from '../media/dto/uploadMedia.dto';

// const storage = new Storage({
//   keyFilename: process.env.GCS_KEYFILE_PATH, // e.g., './gcs-key.json'
// });
// const bucketName = process.env.GCS_BUCKET_NAME;

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

  async uploadMedia(media, uploadMediaDto, userId) {
    try {
      // const { url, filename } = uploadImageDto;
      // const response = await axios.get(url, { responseType: 'arraybuffer' });
      // const fileExt = path.extname(new URL(url).pathname) || '.jpg';
      // const gcsFilename = `${filename || uuidv4()}${fileExt}`;
      // const bucket = storage.bucket(bucketName);
      // const file = bucket.file(gcsFilename);
      // await file.save(response.data, {
      //   metadata: { contentType: response.headers['content-type'] },
      //   resumable: false,
      // });
      // await file.makePublic();
      // return {
      //   gcs_url: `https://storage.googleapis.com/${bucketName}/${gcsFilename}`,
      //   filename: gcsFilename,
      // };
    } catch (error) {
      console.error('GCS upload failed:', error);
      return {
        error: 'Failed to upload to GCS',
        details: error.response?.data || error.message,
      };
    }
  }
}
