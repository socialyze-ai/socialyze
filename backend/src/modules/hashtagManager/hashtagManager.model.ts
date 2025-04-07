// src/hashtagManager/schemas/hashtagManager.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class HashtagManager {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  hashtags: string[];
}

export const HashtagManagerSchema =
  SchemaFactory.createForClass(HashtagManager);
