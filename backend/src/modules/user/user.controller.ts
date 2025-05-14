import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { AuthInterceptor } from 'src/interceptor/authInterceptor.interceptor';
import { OtpVerifyDto } from './dto/otpVerify.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @UseInterceptors(AuthInterceptor)
  @Get('isLoggedIn')
  async isLoggedIn(@Req() req: any) {
    const userId = req.user.userId;
    return await this.userService.isLoggedIn(userId);
  }

  @UseInterceptors(AuthInterceptor)
  @Post('otpVerify')
  async otpVerify(@Body() otpVerifyDto: OtpVerifyDto, @Req() req: any) {
    const userId = req.user.userId;
    return await this.userService.verifyOtp(otpVerifyDto, userId);
  }

  @UseInterceptors(AuthInterceptor)
  @Post('otpResend')
  async otpResend(@Req() req: any) {
    const userId = req.user.userId;
    return await this.userService.otpResend(userId);
  }
}
