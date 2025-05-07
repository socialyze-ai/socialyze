import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel } from '../channel/channel.model';
import { OAuthSession } from 'src/schema/oauthsession.schema';
import { TwitterApi } from 'twitter-api-v2';
import { Post } from '../post/post.model';
import * as sharp from 'sharp';
import axios from 'axios';
import { lookup } from 'mime-types';

@Injectable()
export class XService {
  scopes = ['x.read', 'x.write', 'users.read', 'offline.access'];

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
    @InjectModel(OAuthSession.name)
    private oauthSessionModel: Model<OAuthSession>,
  ) {}

  async getAuthUrl(userId: Types.ObjectId) {
    const client = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
    });

    const { url, oauth_token, oauth_token_secret } =
      await client.generateAuthLink(
        process.env.FRONTEND_URL + '/authenticate',
        {
          authAccessType: 'write',
          linkMode: 'authenticate',
          forceLogin: false,
        },
      );

    await this.oauthSessionModel.create({
      state: oauth_token,
      secret: oauth_token_secret,
      redirectUri: process.env.FRONTEND_URL + '/authenticate',
      scopes: this.scopes,
      handle: 'x',
      user: new Types.ObjectId(userId),
      status: 'PENDING',
    });

    return {
      url,
    };
  }

  async authenticate(userId: string, authCode: string) {
    const [oauth_token, oauth_verifier, oauth_token_secret] =
      authCode.split(':');
    const startingClient = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    const { accessToken, accessSecret, client } =
      await startingClient.login(oauth_verifier);

    const { data } = await client.v2.me({
      'user.fields': 'profile_image_url,username,name,id,verified',
    });

    await this.channelModel.findOneAndUpdate(
      { channelId: data.id, user: new Types.ObjectId(userId) },
      {
        user: new Types.ObjectId(userId),
        workspace: new Types.ObjectId(),
        handle: 'x',
        accesstoken: accessToken + ':' + accessSecret,
        channelId: data.id,
        channelName: data.username,
        channelPicture: data.profile_image_url || '',
      },
      { upsert: true, new: true },
    );

    return { success: true, message: 'X account connected successfully' };
  }

  async postTweet(accessToken: string, message: string) {
    const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
    const client = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: accessTokenSplit,
      accessSecret: accessSecretSplit,
    });

    const { data } = await client.v2.tweet(message);
    return {
      success: true,
      tweetId: data.id,
      url: `https://twitter.com/user/status/${data.id}`,
    };
  }

  async publish(
    post: Post,
  ): Promise<{ success: boolean; postId?: string; postUrl?: string }> {
    try {
      const channel = await this.channelModel.findById(post.channelId).exec();
      if (!channel) {
        throw new InternalServerErrorException('Channel not found for X post.');
      }

      if (channel.handle !== 'x')
        throw new InternalServerErrorException({
          success: false,
          message: 'Not an X Channel Id',
        });

      const [accessToken, accessSecret] = channel.accesstoken.split(':');

      const client = new TwitterApi({
        appKey: process.env.X_API_KEY!,
        appSecret: process.env.X_API_SECRET!,
        accessToken,
        accessSecret,
      });

      const {
        data: { username },
      } = await client.v2.me({ 'user.fields': 'username' });

      // Prepare media uploads
      let media_ids: string[] = [];
      if (post.media && post.media.length > 0) {
        const uploadResults = await Promise.all(
          post.media.map(async (url) => {
            const response = await axios.get(url, {
              responseType: 'arraybuffer',
            });
            const buffer = Buffer.from(response.data);
            const mimeType = lookup(url) || '';

            let mediaBuffer = buffer;

            if (mimeType.startsWith('image/') && mimeType !== 'image/gif') {
              mediaBuffer = await sharp(buffer)
                .resize({ width: 1000 })
                .toBuffer();
            } else if (mimeType === 'image/gif') {
              mediaBuffer = await sharp(buffer, { animated: true })
                .resize({ width: 1000 })
                .gif()
                .toBuffer();
            }

            const mediaId = await client.v1.uploadMedia(mediaBuffer, {
              mimeType,
            });
            return mediaId;
          }),
        );

        media_ids = uploadResults.filter(Boolean);
      }

      const media_ids_tuple = media_ids.slice(0, 4) as
        | [string]
        | [string, string]
        | [string, string, string]
        | [string, string, string, string];

      const tweetRes = await client.v2.tweet({
        text: post.text,
        ...(media_ids.length
          ? {
              media: {
                media_ids: media_ids_tuple,
              },
            }
          : {}),
      });

      const tweetId = tweetRes.data.id;
      const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;

      return {
        success: true,
        postId: tweetId,
        postUrl: tweetUrl,
      };
    } catch (error) {
      console.error('X publish error:', error);
      return {
        success: false,
      };
    }
  }
}
