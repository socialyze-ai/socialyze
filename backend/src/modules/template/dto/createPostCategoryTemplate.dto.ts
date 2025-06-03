import { IsEnum, IsString, IsOptional } from 'class-validator';

export enum PostCategoryType {
  CUSTOM = 'custom',
  DEFAULT = 'default',
}

export enum SocialHandle {
  FB = 'facebook',
  INSTA = 'instagram',
  LINKED = 'linkedin',
  X = 'x',
}

export class CreatePostCategoryTemplateDto {
  @IsEnum(SocialHandle)
  handle: SocialHandle;

  @IsEnum(PostCategoryType)
  type: PostCategoryType;

  @IsString()
  name: string;
}
