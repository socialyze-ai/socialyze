import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { AuthInterceptor } from 'src/interceptor/authInterceptor.interceptor';
import { GetImagesDto } from './dto/getImages.dto';
import { UploadMediaDto } from './dto/uploadMedia.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadMediaForUnsplashDto } from './dto/uploadMediaForUnsplash.dto';

@Controller('media')
@UseInterceptors(AuthInterceptor)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('getImages')
  create(@Body() getImagesDto: GetImagesDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.mediaService.getImages(getImagesDto, userId);
  }

  @Post('uploadMedia')
  @UseInterceptors(FileInterceptor('file'))
  uploadMedia(
    @UploadedFile() media: Express.Multer.File,
    @Body() uploadMediaDto: UploadMediaDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.mediaService.uploadMedia(media, uploadMediaDto, userId);
  }

  @Post('uploadMediaForUnsplash')
  uploadMediaForUnsplash(
    @Body() uploadMediaForUnsplashDto: UploadMediaForUnsplashDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.mediaService.uploadMediaForUnsplash(
      uploadMediaForUnsplashDto,
      userId,
    );
  }
}
