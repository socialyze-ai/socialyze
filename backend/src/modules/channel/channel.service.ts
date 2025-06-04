import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channel } from './channel.model';
import { Model, Types } from 'mongoose';
import { ConnectChannelDto } from './dto/connectChannel.dto';
import { FacebookService } from '../service/facebook.service';
import { OAuthSession } from 'src/schema/oauthsession.schema';
import { InstagramService } from '../service/instagram.service';
import { XService } from '../service/x.service';
import { LinkedinService } from '../service/linkedin.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
    @InjectModel(OAuthSession.name)
    private oauthSessionModel: Model<OAuthSession>,
    private readonly facebookService: FacebookService,
    private readonly instagramService: InstagramService,
    private readonly xService: XService,
    private readonly linkedinService: LinkedinService,
  ) {}

  async getChannels(userId: string): Promise<Channel[]> {
    try {
      const channels = await this.channelModel
        .find({ user: new Types.ObjectId(userId) })
        .lean();
      return channels;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw new Error('Failed to fetch channels');
    }
  }

  async getAuthUrl(
    connectChannelDto: ConnectChannelDto,
    userId: Types.ObjectId,
  ): Promise<any> {
    const { handle } = connectChannelDto;

    let authUrl;
    if (handle === 'facebook') {
      authUrl = await this.facebookService.getAuthUrl(userId);
    } else if (handle === 'instagram') {
      authUrl = await this.instagramService.getAuthUrl(userId);
    } else if (handle === 'x') {
      authUrl = await this.xService.getAuthUrl(userId);
    } else if (handle === 'linkedin') {
      authUrl = await this.linkedinService.getAuthUrl(userId);
    }

    return authUrl;
  }

  async authenticate(
    connectChannelDto: ConnectChannelDto,
    userId: string,
  ): Promise<any> {
    try {
      let { authCode, state } = connectChannelDto;

      const oauthSession = await this.oauthSessionModel.findOne({
        user: new Types.ObjectId(userId),
        state,
      });

      if (!oauthSession) {
        throw new Error('Invalid OAuth session');
      }

      let response;
      if (oauthSession.handle === 'facebook') {
        response = await this.facebookService.authenticate(userId, authCode);
      } else if (oauthSession.handle === 'instagram') {
        response = await this.instagramService.authenticate(userId, authCode);
      } else if (oauthSession.handle === 'x') {
        authCode = authCode + ':' + oauthSession.secret;
        response = await this.xService.authenticate(userId, authCode);
      } else if (oauthSession.handle === 'linkedin') {
        response = await this.linkedinService.authenticate(userId, authCode);
      }

      if (response.success) {
        await this.oauthSessionModel.updateOne(
          { _id: oauthSession._id },
          { $set: { status: 'COMPLETED' } },
        );
      }

      return response;
    } catch (error) {
      console.error('Authenticate error:', error);
      return { success: false, message: error.message };
    }
  }
}
