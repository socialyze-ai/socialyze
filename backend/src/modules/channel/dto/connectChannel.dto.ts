import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { SocialMediaHandleEnum } from 'src/enums/enums';

export class ConnectChannelDto {
  @IsEnum(SocialMediaHandleEnum, {
    message: 'handle must be a valid social media platform',
  })
  @IsNotEmpty()
  handle: SocialMediaHandleEnum;

  @IsString()
  @IsNotEmpty()
  authCode: string;

  @IsString()
  state: string;
}
