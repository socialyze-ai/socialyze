import { IsNotEmpty, IsString } from 'class-validator';

export class UploadMediaForUnsplashDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  postId: string;
}
