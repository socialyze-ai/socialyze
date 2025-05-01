import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ArrayNotEmpty,
  IsISO8601,
} from 'class-validator';

export class PostDto {
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'channelId must be a valid ObjectId',
  })
  channelId: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @ArrayNotEmpty()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    each: true,
    message: 'Each label must be a valid ObjectId',
  })
  label: string[];

  @IsArray()
  @IsString({ each: true })
  media: string[];

  @IsEnum(['draft', 'scheduled', 'postnow'])
  postType: 'draft' | 'scheduled' | 'postnow';

  @IsEnum(['queued', 'failed', 'published'])
  postStatus: 'queued' | 'failed' | 'published';

  @IsOptional()
  @IsISO8601()
  scheduledTime?: string;
}
