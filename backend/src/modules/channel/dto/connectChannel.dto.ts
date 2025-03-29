import { IsNotEmpty, IsEnum, IsString } from 'class-validator';

export enum SocialMediaHandle {
  INSTAGRAM = 'Instagram',
  FACEBOOK = 'Facebook',
  LINKEDIN = 'LinkedIn',
  X = 'X',
}

export class ConnectChannelDto {
  @IsEnum(SocialMediaHandle, {
    message: 'handle must be a valid social media platform',
  })
  @IsNotEmpty()
  handle: SocialMediaHandle;

  @IsString()
  @IsNotEmpty()
  authCode: string;
}
