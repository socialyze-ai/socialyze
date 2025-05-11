import { IsNotEmpty, IsString } from 'class-validator';

export class UploadMediaWithLinkDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  postId: string;
}
