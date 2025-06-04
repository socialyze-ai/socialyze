import { IsEnum, IsString, IsOptional } from 'class-validator';
import { SocialMediaHandleEnum } from 'src/enums/enums';

export enum PostCategoryType {
  CUSTOM = 'custom',
  DEFAULT = 'default',
}

export class CreatePostCategoryTemplateDto {
  @IsEnum(SocialMediaHandleEnum)
  handle: SocialMediaHandleEnum;

  @IsEnum(PostCategoryType)
  type: PostCategoryType;

  @IsString()
  name: string;
}
