import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class OAuthSession {
  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  redirectUri: string;

  @Prop({ type: [String], required: true })
  scopes: string[];

  @Prop()
  code?: string;

  @Prop({ required: true, enum: ['instagram', 'facebook', 'linkedIn', 'x'] })
  handle: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, enum: ['PENDING', 'COMPLETED', 'FAILED'] })
  status: string;
}

export const OAuthSessionSchema = SchemaFactory.createForClass(OAuthSession);
