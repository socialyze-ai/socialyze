import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AuthInterceptor } from 'src/interceptor/authInterceptor.interceptor';
import { ConnectChannelDto } from './dto/connectChannel.dto';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @UseInterceptors(AuthInterceptor)
  @Post('connect')
  async register(
    @Body() connectChannelDto: ConnectChannelDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.channelService.connect(connectChannelDto, userId);
  }

  @UseInterceptors(AuthInterceptor)
  @Post('authenticate')
  async authenticate(
    @Body() connectChannelDto: ConnectChannelDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.channelService.authenticate(connectChannelDto, userId);
  }
}
