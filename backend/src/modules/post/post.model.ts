import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'Channel', required: true })
  channelId: Types.ObjectId;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: [Types.ObjectId], ref: 'Label', default: [] })
  label: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  media: string[];

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

  @Prop({ type: String })
  failedReason: string;

  @Prop({ type: Date })
  scheduledTime?: Date;

  // Engagement Metrics
  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: Number, default: 0 })
  comments: number;

  @Prop({ type: Number, default: 0 })
  retweets: number;

  @Prop({ type: Number, default: 0 })
  impressions: number;

  @Prop({ type: Number, default: 0 })
  clicks: number;

  @Prop({ type: Number, default: 0 })
  engRate: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
