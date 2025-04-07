import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel } from '../channel/channel.model';
import { OAuthSession } from 'src/schema/oauthsession.schema';
import { TwitterApi } from 'twitter-api-v2';

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
    console.log('Here1', process.env.X_API_KEY, process.env.X_API_SECRET!);
    const { url, oauth_token, oauth_token_secret } =
      await client.generateAuthLink(
        process.env.FRONTEND_URL + '/authenticate',
        {
          authAccessType: 'write',
          linkMode: 'authenticate',
          forceLogin: false,
        },
      );
    console.log('Here', url, oauth_token, oauth_token_secret);

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
    console.log('oauth_token', oauth_token);
    console.log('oauth_verifier', oauth_verifier);
    console.log('oauth_token_secret', oauth_token_secret);
    const startingClient = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    console.log('startingClient', startingClient);

    const { accessToken, accessSecret, client } =
      await startingClient.login(oauth_verifier);

    console.log('accessToken', accessToken);
    console.log('accessSecret', accessSecret);
    console.log('client', client);

    const { data } = await client.v2.me({
      'user.fields': 'profile_image_url,username,name,id,verified',
    });

    console.log('data', data);

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
}
