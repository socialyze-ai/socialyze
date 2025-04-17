import { Injectable } from '@nestjs/common';
import { GetImagesDto } from './dto/getImages.dto';
import { UnsplashService } from '../service/unsplash.service';
import { UploadMediaDto } from './dto/uploadMedia.dto';
import { GiphyService } from '../service/giphy.service';
import { GoogleImageService } from '../service/googleImage.service';
import { GcsService } from '../service/gcs.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly unsplashService: UnsplashService,
    private readonly giphyService: GiphyService,
    private readonly googleImageService: GoogleImageService,
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
      const { provider, postId } = uploadMediaDto;
      let response;
      if (provider === 'unsplash') {
        response = await this.unsplashService.uploadMedia(
          media,
          uploadMediaDto,
          userId,
        );
      } else {
        const foldering = `${userId}/${postId}`;
        response = await this.gcsService.uploadMedia(media, foldering);
      }
      return response;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw new Error('Failed to fetch channels');
    }
  }
}
