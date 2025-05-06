import { Injectable } from '@nestjs/common';
import { GetImagesDto } from './dto/getImages.dto';
import { UnsplashService } from '../service/unsplash.service';
import { UploadMediaDto } from './dto/uploadMedia.dto';
import { GiphyService } from '../service/giphy.service';
import { GoogleImageService } from '../service/googleImage.service';
import { GcsService } from '../service/gcs.service';
import { UploadMediaForUnsplashDto } from './dto/uploadMediaForUnsplash.dto';
import { TenorService } from '../service/tenor.service';
import { PexelsService } from '../service/pexels.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly unsplashService: UnsplashService,
    private readonly giphyService: GiphyService,
    private readonly googleImageService: GoogleImageService,
    private readonly tenorService: TenorService,
    private readonly pexelsService: PexelsService,
    private readonly gcsService: GcsService,
  ) {}

  async getImages(getImagesDto: GetImagesDto, userId: string) {
    try {
      const { provider } = getImagesDto;
      let response;
      if (provider === 'unsplash') {
        response = await this.unsplashService.getImages(getImagesDto);
      } else if (provider === 'giphy') {
        return await this.giphyService.getTrendingGifs(getImagesDto);
      } else if (provider === 'google') {
        return await this.googleImageService.getImages(getImagesDto);
      } else if (provider === 'tenor') {
        return await this.tenorService.getImages(getImagesDto);
      } else if (provider === 'pexels') {
        return await this.pexelsService.getImages(getImagesDto);
      } else {
        response = { message: 'Unknown provided' };
      }
      return response;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw new Error('Failed to fetch channels');
    }
  }

  async uploadMedia(
    media: Express.Multer.File,
    uploadMediaDto: UploadMediaDto,
    userId: string,
  ) {
    try {
      const { postId } = uploadMediaDto;

      const foldering = `${userId}/${postId}`;
      const response = await this.gcsService.uploadMedia(media, foldering);

      return response;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw new Error('Failed to fetch channels');
    }
  }

  async uploadMediaForUnsplash(
    uploadMediaForUnsplashDto: UploadMediaForUnsplashDto,
    userId: string,
  ) {
    try {
      const { url, postId } = uploadMediaForUnsplashDto;
      const foldering = `${userId}/${postId}`;
      const media = await this.unsplashService.downloadMedia(url);
      const response = await this.gcsService.uploadMedia(media, foldering);

      return response;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw new Error('Failed to fetch channels');
    }
  }
}
