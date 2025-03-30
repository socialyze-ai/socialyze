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
  @Get()
  async channels(@Req() req: any) {
    const userId = req.user.userId;
    return this.channelService.getChannels(userId);
  }
  @UseInterceptors(AuthInterceptor)
  @Post('getAuthUrl')
  async getAuthUrl(
    @Body() connectChannelDto: ConnectChannelDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.channelService.getAuthUrl(connectChannelDto, userId);
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
