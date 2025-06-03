import { IsEnum, IsString, IsObject, IsMongoId } from 'class-validator';

export class CreatePostTemplateDto {
  @IsMongoId()
  postCategory: string;

  @IsObject()
  body: Record<string, any>;
}
