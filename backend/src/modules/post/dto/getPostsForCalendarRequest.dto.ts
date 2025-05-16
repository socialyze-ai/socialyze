import {
  IsArray,
  IsEnum,
  IsOptional,
  IsMongoId,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsForCalendarRequestDto {
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  channel?: string[];

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

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
