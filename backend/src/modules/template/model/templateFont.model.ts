import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemplateFontDocument = TemplateFont & Document;

@Schema({ timestamps: true })
export class TemplateFont {
  @Prop({ type: String, required: true })
  name: string;
}

export const TemplateFontSchema = SchemaFactory.createForClass(TemplateFont);
