import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channel } from './channel.model';
import { Model } from 'mongoose';
import { ConnectChannelDto } from './dto/connectChannel.dto';
import { FacebookService } from '../service/facebook.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
    private readonly facebookService: FacebookService,
  ) {}

  async connect(
    connectChannelDto: ConnectChannelDto,
    userId: string,
  ): Promise<any> {
    const { handle, authCode } = connectChannelDto;
    if (handle === 'Facebook') {
      await this.facebookService.connect(userId, authCode);
    }
  }

  async authenticate(
    connectChannelDto: ConnectChannelDto,
    userId: string,
  ): Promise<any> {
    const { handle } = connectChannelDto;
    if (handle === 'Facebook') {
      await this.facebookService.getAuthUrl();
    }
  }
}
