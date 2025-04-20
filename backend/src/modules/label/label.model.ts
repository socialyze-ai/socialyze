// src/hashtagManager/schemas/hashtagManager.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Label {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace: Types.ObjectId;

  @Prop({ type: String })
  color: string;
}

export const LabelSchema = SchemaFactory.createForClass(Label);
