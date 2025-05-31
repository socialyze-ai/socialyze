import { IsArray, IsString } from 'class-validator';

export class CreateFontTemplatesDto {
  @IsArray()
  @IsString({ each: true })
  fonts: string[];
}
