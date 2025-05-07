import { IsString, Matches } from 'class-validator';
import { Types } from 'mongoose';

export class PublishDto {
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'channelId must be a valid ObjectId',
  })
  postId: Types.ObjectId;
}
