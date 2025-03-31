import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel } from '../channel/channel.model';
import axios from 'axios';
import { OAuthSession } from 'src/schema/oauthsession.schema';

@Injectable()
export class InstagramService {
  scopes = [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'business_management',
    'instagram_manage_comments',
    'instagram_content_publish',
  ];

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
    @InjectModel(OAuthSession.name)
    private oauthSessionModel: Model<OAuthSession>,
  ) {}

  async getAuthUrl(userId: Types.ObjectId) {
    const state = Math.random().toString(36).substring(7);
    const authUrl = {
      url:
        'https://www.facebook.com/v20.0/dialog/oauth' +
        `?client_id=${process.env.FACEBOOK_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL + '/authenticate')}` +
        `&state=${state}` +
        `&scope=${this.scopes.join(',')}` +
        `&response_type=code`,
      state,
    };

    await this.oauthSessionModel.create({
      state,
      redirectUri: process.env.FRONTEND_URL + '/authenticate',
      scopes: this.scopes,
      handle: 'instagram',
      user: new Types.ObjectId(userId),
      status: 'PENDING',
    });

    return authUrl;
  }

  async authenticate(userId: string, authCode: string) {
    try {
      const authData = await this.getAccessToken(authCode);
      if (!authData.accessToken)
        throw new Error('Failed to retrieve access token');

      const instagramAccounts = await this.getInstagramAccount(
        authData.accessToken,
      );
      if (!instagramAccounts) throw new Error('No Instagram account linked');

      for (const instagramAccount of instagramAccounts) {
        await this.channelModel.findOneAndUpdate(
          { channelId: instagramAccount.id, user: new Types.ObjectId(userId) },
          {
            user: new Types.ObjectId(userId),
            workspace: new Types.ObjectId(),
            handle: 'instagram',
            accesstoken: authData.accessToken,
            refreshtoken: authData.refreshToken,
            channelId: instagramAccount.id,
            channelName: instagramAccount.username,
            channelPicture: instagramAccount.profile_picture_url || '',
          },
          { upsert: true, new: true },
        );
      }

      return {
        success: true,
        message: 'Instagram account connected successfully',
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getAccessToken(code: string) {
    try {
      const response = await axios.get(
        'https://graph.facebook.com/v20.0/oauth/access_token',
        {
          params: {
            client_id: process.env.FACEBOOK_APP_ID,
            redirect_uri: process.env.FRONTEND_URL + '/authenticate',
            client_secret: process.env.FACEBOOK_APP_SECRET,
            code,
            grant_type: 'authorization_code',
          },
        },
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error(
        'Instagram auth error:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to authenticate with Instagram');
    }
  }

  async getInstagramAccount(accessToken: string) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/me/accounts`,
        {
          params: {
            fields:
              'id,name,instagram_business_account{username,profile_picture_url}',
            access_token: accessToken,
          },
        },
      );

      const businessAccounts = response.data.data;
      if (businessAccounts.length === 0) return null;

      const instagramAccounts = businessAccounts
        .filter((account) => account.instagram_business_account)
        .map((account) => ({
          id: account.instagram_business_account.id,
          username: account.instagram_business_account.username,
          profile_picture_url:
            account.instagram_business_account.profile_picture_url,
        }));

      return instagramAccounts.length > 0 ? instagramAccounts : null;
    } catch (error) {
      console.error(
        'Error fetching Instagram account:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch Instagram account');
    }
  }
}
