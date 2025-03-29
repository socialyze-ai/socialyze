import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel } from '../channel/channel.model';
import { User } from '../user/user.model';
import axios from 'axios';

@Injectable()
export class FacebookService {
  scopes = [
    'pages_show_list',
    'business_management',
    'pages_manage_posts',
    'pages_manage_engagement',
    'pages_read_engagement',
    'read_insights',
  ];

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
  ) {}

  /**
   * Generate Facebook OAuth URL
   */
  getAuthUrl() {
    const state = Math.random().toString(36).substring(7);
    return {
      url:
        'https://www.facebook.com/v20.0/dialog/oauth' +
        `?client_id=${process.env.FACEBOOK_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL + '/facebook/callback')}` +
        `&state=${state}` +
        `&scope=${this.scopes.join(',')}`,
      state,
    };
  }

  /**
   * Handles Facebook OAuth authentication and connects pages
   */
  async connect(userId: string, authCode: string) {
    try {
      // Step 1: Exchange code for access token
      const authData = await this.authenticate(authCode);
      if (!authData.accessToken)
        throw new Error('Failed to retrieve access token');

      // Step 2: Fetch pages the user manages
      const pages = await this.pages(authData.accessToken);
      if (!pages || pages.length === 0) throw new Error('No pages found');

      // Step 3: Save pages to `Channel` collection
      for (const page of pages) {
        await this.channelModel.findOneAndUpdate(
          { channelId: page.id, user: userId },
          {
            user: userId,
            workspace: new Types.ObjectId(), // Assign workspace (Modify as per logic)
            handle: 'Facebook',
            accesstoken: page.access_token,
            refreshtoken: authData.refreshToken,
            channelId: page.id,
            channelName: page.name,
            channelPicture: page.picture?.data?.url || '',
          },
          { upsert: true, new: true },
        );
      }

      console.log('Pages connected successfully');
      return {
        success: true,
        message: 'Facebook pages connected successfully',
      };
    } catch (error) {
      console.error('Facebook connect error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Exchange auth code for access & refresh tokens
   */
  async authenticate(code: string) {
    try {
      const response = await axios.get(
        'https://graph.facebook.com/v20.0/oauth/access_token',
        {
          params: {
            client_id: process.env.FACEBOOK_APP_ID,
            redirect_uri: process.env.FRONTEND_URL + '/facebook/callback',
            client_secret: process.env.FACEBOOK_APP_SECRET,
            code,
          },
        },
      );

      if (!response.data.access_token) throw new Error('Invalid auth code');

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.access_token, // Facebook does not provide a refresh token
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error(
        'Facebook auth error:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to authenticate with Facebook');
    }
  }

  /**
   * Fetch user’s Facebook Pages
   */
  async pages(accessToken: string) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/me/accounts`,
        {
          params: {
            fields: 'id,name,access_token,picture',
            access_token: accessToken,
          },
        },
      );

      return response.data.data || [];
    } catch (error) {
      console.error(
        'Error fetching pages:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch pages');
    }
  }
}
