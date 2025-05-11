import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class PostDto {
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'channelId must be a valid ObjectId',
  })
  channelId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(['facebook', 'instagram', 'x', 'linkedin'])
  handle: 'facebook' | 'instagram' | 'x' | 'linkedin';

  @IsArray()
  @ArrayNotEmpty()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    each: true,
    message: 'Each label must be a valid ObjectId',
  })
  label: Types.ObjectId[];

  @IsArray()
  @IsString({ each: true })
  media: string[];

  @IsEnum(['draft', 'scheduled', 'postnow'])
  postType: 'draft' | 'scheduled' | 'postnow';

  @IsEnum(['queued', 'failed', 'published'])
  postStatus: 'queued' | 'failed' | 'published';

  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  scheduledTime?: Date;

  @IsOptional()
  @IsString()
  jobId?: Date;
}
