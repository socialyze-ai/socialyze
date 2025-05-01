import { IsArray, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsRequestDto {
  @IsOptional()
  @IsArray()
  @IsEnum(['facebook', 'instagram', 'x', 'linkedin'], { each: true })
  handle?: ('facebook' | 'instagram' | 'x' | 'linkedin')[];

  @IsOptional()
  @IsArray()
  @IsEnum(['queued', 'failed', 'published', 'draft'], { each: true })
  postStatus?: ('queued' | 'failed' | 'published' | 'draft')[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  label?: string[];

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
