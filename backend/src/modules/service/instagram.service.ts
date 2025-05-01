import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel } from '../channel/channel.model';
import axios from 'axios';
import { OAuthSession } from 'src/schema/oauthsession.schema';
import { Post } from '../post/post.model';

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

  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async publish(post: Post) {
    const channel = await this.channelModel.findById(post.channelId);
    if (!channel) throw new Error('Channel not found');

    if (channel.handle !== 'instagram')
      throw new InternalServerErrorException({
        success: false,
        message: 'Not an Instagrem Channel Id',
      });

    const accessToken = channel.accesstoken;
    const instagramAccountId = channel.channelId;

    const mediaUrls = post.media || [];
    const isSingle = mediaUrls.length === 1;
    const message = post.text || '';
    const isVideo = mediaUrls[0]?.endsWith('.mp4');

    const uploadMedia = async (url: string, isFirst: boolean) => {
      const isVideo = url.endsWith('.mp4');
      const mediaType = isVideo ? 'VIDEO' : 'IMAGE';

      const params: any = {
        access_token: accessToken,
        ...(isVideo ? { video_url: url } : { image_url: url }),
      };

      // Only add caption for the first media if single post
      if (isFirst && isSingle) {
        params.caption = message;
      }

      const { data } = await axios.post(
        `https://graph.facebook.com/v20.0/${instagramAccountId}/media`,
        null,
        { params },
      );

      // Poll status until upload is complete
      let status = 'IN_PROGRESS';
      while (status === 'IN_PROGRESS') {
        const { data: statusRes } = await axios.get(
          `https://graph.facebook.com/v20.0/${data.id}`,
          {
            params: {
              fields: 'status_code',
              access_token: accessToken,
            },
          },
        );
        status = statusRes.status_code;
        if (status === 'IN_PROGRESS') await this.delay(3000);
      }

      return data.id;
    };

    const mediaIds = await Promise.all(
      mediaUrls.map((url, idx) => uploadMedia(url, idx === 0)),
    );

    let creationId = '';

    if (mediaIds.length === 1) {
      creationId = mediaIds[0];
    } else {
      // Create carousel container
      const { data } = await axios.post(
        `https://graph.facebook.com/v20.0/${instagramAccountId}/media`,
        null,
        {
          params: {
            media_type: 'CAROUSEL',
            children: mediaIds.join(','),
            caption: message,
            access_token: accessToken,
          },
        },
      );

      // Wait for carousel container to be ready
      let status = 'IN_PROGRESS';
      while (status === 'IN_PROGRESS') {
        const { data: statusRes } = await axios.get(
          `https://graph.facebook.com/v20.0/${data.id}`,
          {
            params: {
              fields: 'status_code',
              access_token: accessToken,
            },
          },
        );
        status = statusRes.status_code;
        if (status === 'IN_PROGRESS') await this.delay(3000);
      }

      creationId = data.id;
    }

    // Publish the media
    const { data: publishRes } = await axios.post(
      `https://graph.facebook.com/v20.0/${instagramAccountId}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: accessToken,
        },
      },
    );

    // Get permalink
    const { data: permalinkRes } = await axios.get(
      `https://graph.facebook.com/v20.0/${publishRes.id}`,
      {
        params: {
          fields: 'permalink',
          access_token: accessToken,
        },
      },
    );

    return {
      postId: publishRes.id,
      postUrl: permalinkRes.permalink,
      success: true,
    };
  }
}
