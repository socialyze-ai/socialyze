import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { SocialMediaHandle } from 'src/types/socialMediaHandle.enum';

export class ConnectChannelDto {
  @IsEnum(SocialMediaHandle, {
    message: 'handle must be a valid social media platform',
  })
  @IsNotEmpty()
  handle: SocialMediaHandle;

  @IsString()
  @IsNotEmpty()
  authCode: string;

  @IsString()
  state: string;
}
