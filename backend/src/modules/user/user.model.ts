import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  profilePic: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
