import { IsInt, Min, IsOptional } from 'class-validator';

export class GetFontTemplatesDto {
  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;
}
