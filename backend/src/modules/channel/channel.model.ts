import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SocialMediaHandleEnum } from 'src/enums/enums';

@Schema({ timestamps: true })
export class Channel {
  @Prop({ required: true, enum: SocialMediaHandleEnum })
  handle: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace: Types.ObjectId;

  @Prop({ required: true })
  accesstoken: string;

  @Prop({ required: true })
  refreshtoken: string;

  @Prop()
  idToken: string;

  @Prop({ required: true })
  channelId: string;

  @Prop({ required: true })
  channelName: string;

  @Prop()
  channelPicture: string;

  @Prop()
  expireIn: number;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
