import { IsEnum, IsString, IsOptional } from 'class-validator';

export enum SocialHandle {
  FB = 'facebook',
  INSTA = 'instagram',
  LINKED = 'linkedin',
  X = 'x',
}

export class GetPostCategoryTemplateDto {
  @IsEnum(SocialHandle)
  handle: SocialHandle;
}
