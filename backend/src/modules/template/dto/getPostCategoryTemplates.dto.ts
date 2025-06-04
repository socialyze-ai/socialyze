import { IsEnum, IsString, IsOptional } from 'class-validator';
import { SocialMediaHandleEnum } from 'src/enums/enums';

export class GetPostCategoryTemplateDto {
  @IsEnum(SocialMediaHandleEnum)
  handle: SocialMediaHandleEnum;
}
