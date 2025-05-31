import { Schema as MongooseSchema, Types, Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TemplatePostDocument = TemplatePost & Document;

@Schema({ timestamps: true })
export class TemplatePost {
  @Prop({ enum: ['custom', 'default'], required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PostCategoryTemplate', required: true })
  postCategory: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  body: Record<string, any>;
}

export const TemplatePostSchema = SchemaFactory.createForClass(TemplatePost);
