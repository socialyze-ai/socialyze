import { IsEnum, IsString, IsObject, IsMongoId } from 'class-validator';

export enum PostTemplateType {
  CUSTOM = 'custom',
  DEFAULT = 'default',
}

export class CreatePostTemplateDto {
  @IsEnum(PostTemplateType)
  type: PostTemplateType;

  @IsMongoId()
  postCategory: string;

  @IsObject()
  body: Record<string, any>;
}
