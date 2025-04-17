import { IsNotEmpty, IsString } from 'class-validator';

export class UploadMediaDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  postId: string;
}
