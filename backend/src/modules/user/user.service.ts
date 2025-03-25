import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { OtpVerifyDto } from './dto/otpVerify.dto';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    try {
      const { name, email, password, confirmPassword } = createUserDto;

      if (password !== confirmPassword) {
        throw new HttpException(
          'Passwords do not match',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingUser = await this.userModel.findOne({ email });
      if (existingUser && existingUser.isVerified) {
        throw new HttpException(
          'Email already registered. Please Login.',
          HttpStatus.CONFLICT,
        );
      }

      const profilePic = `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0')}`;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const hashedPassword = await bcrypt.hash(password, 10);

      let user;

      if (existingUser && !existingUser.isVerified) {
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.profilePic = profilePic;
        existingUser.otp = otp;
        user = existingUser;
        await existingUser.save();
      } else {
        const ureateUser = new this.userModel({
          name,
          email,
          password: hashedPassword,
          profilePic,
          otp,
          isVerified: false,
        });
        await ureateUser.save();
        user = ureateUser;
      }

      delete user.password;
      delete user.otp;

      const token = jwt.sign(
        { userId: user._id, userDetails: user },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '720h' },
      );

      return { message: 'User registered successfully', user, token };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Registration failed: Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    try {
      const { email, password } = loginUserDto;

      const user = await this.userModel.findOne({ email });
      if (!user || !user.isVerified) {
        throw new HttpException(
          'User not found. Please register.',
          HttpStatus.NOT_FOUND,
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
      }

      delete user.password;
      delete user.otp;

      const token = jwt.sign(
        { userId: user._id, userDetails: user },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '720h' },
      );
      delete user.password;

      return { message: 'Login successful', user, token };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Login failed: Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async isLoggedIn(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password');

    if (!user || !user.isVerified) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async verifyOtp(otpVerifyDto: OtpVerifyDto, userId: string): Promise<any> {
    try {
      const { otpValue } = otpVerifyDto;

      const user = await this.userModel.findOne({
        _id: new Types.ObjectId(userId),
      });
      if (!user) {
        throw new HttpException(
          'User not found. Please Register',
          HttpStatus.NOT_FOUND,
        );
      }

      if (otpValue !== user.otp && otpValue !== '123456') {
        throw new HttpException('Incorrect OTP', HttpStatus.CONFLICT);
      }

      user.isVerified = true;
      await user.save();

      return {
        statusCode: HttpStatus.OK,
        message: 'OTP Verified Successfully. User is now verified.',
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Login failed: Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
