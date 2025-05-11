import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'Channel', required: true })
  channelId: Types.ObjectId;

  @Prop({ type: String })
  postId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({
    type: String,
    enum: ['facebook', 'instagram', 'x', 'linkedin'],
    required: true,
  })
  handle: 'facebook' | 'instagram' | 'x' | 'linkedin';

  @Prop({
    type: String,
    enum: ['draft', 'scheduled', 'postnow'],
    required: true,
  })
  postType: 'draft' | 'scheduled' | 'postnow';

  @Prop({
    type: String,
    enum: ['queued', 'failed', 'published'],
    required: true,
  })
  postStatus: 'queued' | 'failed' | 'published' | 'draft';

  @Prop({ type: Date })
  scheduledTime?: Date;

  @Prop({ type: [String] })
  media: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Label' })
  label: Types.ObjectId[];

  @Prop({ type: String })
  postUrl: string;

  @Prop({ type: Number })
  likes: number;

  @Prop({ type: Number })
  comments: number;

  @Prop({ type: Number })
  retweets: number;

  @Prop({ type: Number })
  impressions: number;

  @Prop({ type: Number })
  clicks: number;

  @Prop({ type: Number })
  engRate: number;

  @Prop({ type: String })
  failedReason: string;

  @Prop({ type: String })
  jobId: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
