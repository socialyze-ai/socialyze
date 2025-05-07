import {
  IsArray,
  IsEnum,
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
} from 'class-validator';

export class GetPostResponseDto {
  @IsString()
  @IsMongoId()
  channelId: string;

  @IsString()
  @IsMongoId()
  createdBy: string;

  @IsString()
  text: string;

  @IsEnum(['draft', 'postnow', 'scheduled'])
  postType: 'draft' | 'postnow' | 'scheduled';

  @IsEnum(['queued', 'failed', 'published', 'draft'])
  postStatus: 'queued' | 'failed' | 'published' | 'draft';

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsArray()
  media: string[];

  @IsArray()
  label: string[];

  @IsString()
  postUrl: string;

  @IsNumber()
  likes: number;

  @IsNumber()
  comments: number;

  @IsNumber()
  retweets: number;

  @IsNumber()
  impressions: number;

  @IsNumber()
  clicks: number;

  @IsNumber()
  engRate: number;

  @IsOptional()
  @IsString()
  failedReason?: string;
}
