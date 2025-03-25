import { IsString, IsEmail, IsBoolean, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  _id: Types.ObjectId;;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  profilePic: string;

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @IsBoolean()
  isVerified: boolean;
}
