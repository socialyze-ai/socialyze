import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { UnsplashService } from '../service/unsplash.service';
import { GiphyService } from '../service/giphy.service';
import { GoogleImageService } from '../service/googleImage.service';
import { GcsService } from '../service/gcs.service';
import { TenorService } from '../service/tenor.service';
import { PexelsService } from '../service/pexels.service';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    UnsplashService,
    GiphyService,
    GoogleImageService,
    TenorService,
    PexelsService,
    GcsService,
  ],
})
export class MediaModule {}
