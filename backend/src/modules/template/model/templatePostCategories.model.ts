import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SocialMediaHandleEnum, TemplateTypeEnum } from 'src/enums/enums';

export type TemplatePostCategoryDocument = TemplatePostCategory & Document;

@Schema({ timestamps: true })
export class TemplatePostCategory {
  @Prop({ enum: Object.values(SocialMediaHandleEnum), required: true })
  handle: string;

  @Prop({ enum: Object.values(TemplateTypeEnum), required: true })
  type: string;

  @Prop({ required: true })
  name: string;
}

export const TemplatePostCategorySchema =
  SchemaFactory.createForClass(TemplatePostCategory);
