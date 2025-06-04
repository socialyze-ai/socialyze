import axios from 'axios';
import * as qs from 'qs';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channel } from '../channel/channel.model';
import { Model, Types } from 'mongoose';
import { OAuthSession } from 'src/schema/oauthsession.schema';
import { Post } from '../post/post.model';

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  providerAccountId: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface PostData {
  id: string;
  content: string;
  imageUrls?: string[];
}

interface PostResponse {
  status: 'posted' | 'failed';
  postId: string;
  id: string;
  releaseURL: string;
}

@Injectable()
export class LinkedinService {
  private clientId = process.env.LINKEDIN_CLIENT_ID!;
  private clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  private redirectUri = process.env.FRONTEND_URL + '/authenticate';
  private scope = ['openid', 'profile', 'email', 'w_member_social'].join(' ');

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
    @InjectModel(OAuthSession.name)
    private oauthSessionModel: Model<OAuthSession>,
  ) {}

  async getAuthUrl(userId: Types.ObjectId) {
    const state = Math.random().toString(36).substring(7);
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${encodeURIComponent(this.scope)}&state=${state}`;

    await this.oauthSessionModel.create({
      state: state,
      redirectUri: process.env.FRONTEND_URL + '/authenticate',
      scopes: this.scope,
      handle: 'linkedin',
      user: new Types.ObjectId(userId),
      status: 'PENDING',
    });

    return {
      url,
    };
  }

  async authenticate(userId: string, authCode: string) {
    console.log('Hereee');
    const tokenRes = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      qs.stringify({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    // tokenRes.data {
    //     access_token: 'AQWLvgJzckQJvEmyuXNFl9Qu1XHuxYo_VRPdqC8zNoprUQZQqAAnhi1XITS7W89OQZ57aA3ckoB3fitiEk945IbkyrTEoHXAvorriDO3YER-NrSKsLh9FOzl_ipAhvYsB0J1pwuXNSR1IxmX3-c8UbBj7_Tjunh2r-guA-WH_YC2hNVzXHy5A3RfBQHd_ELJ_894H7NiBnOgTv6lfhQcxdPVIhRZQELPexfY-Rq9nN3ZVSj_loNmnE-_a7DqNo-VBclSA2s01IoHXHiU5TnJM8UgV_g2iCa3mgsvCq43bfV4tVSSwXZThUtNi23DdLSacsQI-sBi_NQ',
    //     expires_in: 5183999,
    //     scope: 'email,openid,profile,w_member_social',
    //     token_type: 'Bearer',
    //     id_token: 'eyJ6aXAiOiJSUzI1NiIsInR5cCI6IkpXVCIsImthhLWJhYjEtNGM2OS05NTk4LTQzNzMxNDk3MjNmZiIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJodHRwczovL3d3dy5saW5rZWRpbi5jb20vb2F1dGgiLCJhdWQiOiI4NjBzZzNoNGUwbWVsaiIsImlhdCI6MTc0ODczODQ1NiwiZXhwIjoxNzQ4NzQyMDU2LCJzdWIiOiJKTkZ3bGN3U3E5IiwibmFtZSI6IlNvY2lhbHl6ZSBBaSIsImdpdmVuX25hbWUiOiJTb2NpYWx5emUiLCJmYW1pbHlfbmFtZSI6IkFpIiwicGljdHVyZSI6Imh0dHBzOi8vbWVkaWEubGljZG4uY29tL2Rtcy9pbWFnZS92Mi9ENTYwM0FRSDkwT2d1SmpTTDdRL3Byb2ZpbGUtZGlzcGxheXBob3RvLXNocmlua180MDBfNDAwL0I1NlpjbzBPWFpHb0FnLS8wLzE3NDg3MzY0Njg5NDI_ZT0yMTQ3NDgzNjQ3JnY9YmV0YSZ0PWloZ0s4Tm8xSEtYeXdUS2Foby1WR3cxLTEyNHhkbmUteERqVEY1UG9idmsiLCJlbWFpbCI6InNvY2lhbHl6ZS5jby5pbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6InRydWUiLCJsb2NhbGUiOiJlbl9VUyJ9.J-HUtQhy-HqkC3VATM4hSCFfZeiMWDKeVGj3oMOMf6w7vxi8wnLUkZI_k-A3-fy0vuZecsXVHPWDg0h13AR8qvcQBOjWd8X30IXpsbguWVRc1ESE0LVR_1jb6H2oU22wS7wf6jG7TuLyWYMH3eUsuHJPbNMX5l-YWRPuZ951mIuATR_TMCZSzlbfjr_9roHOI0dI1ZFTdLCgRckfGTT__K6g8ON4JrpmDGXfUKVM8EDQZ0Q8GMqxAdEAVigdGCVf5Fp30g8sdddLmxdz5R0vIB4Y2e6X3jbD8tWmRZTCK2NbAcP7wKjTSTcgiEAXmvj37pZkjVy9cCMgKwPRX7w53ZmT2wtp7w9qW4EmL_D9xufHoLXt7JJkMfXePlEB9t0mR4mDrHRSsUDDfty-f1EuxrOfPXy0iZgzQlQfWoiljBbvIlUk2qw0YjOhhAW4V-s2trUvO4niMH6F2XRyzF-CUyCwKjmNYwEUemrZuUasQJdCC99gz96Pon66H0rLy-8pjxnJM3ywSXF9lNF5qoG965vlHbF31r-ov8cq2CI8jdrhV_U6QRe2jkOeICd64RwXRO3ybyIvD1SFqSsmUME02Yop7BQV6FtMPm77lK1cWx4xcTsrYCuvDZVv8X1U7SujN-21N6tHbPeTtZTwEEJdhPg1kQTF2wEhORrpQ7yt224'
    // }

    const accessToken = tokenRes.data.access_token;

    const userInfoRes = await axios.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // userInfoRes.data {
    //     sub: 'JNFwlcwSq9',
    //     email_verified: true,
    //     name: 'Socialyze Ai',
    //     locale: { country: 'US', language: 'en' },
    //     given_name: 'Socialyze',
    //     family_name: 'Ai',
    //     email: 'socialyze.co.in@gmail.com',
    //     picture: 'https://media.licdn.com/dms/image/v2/D5603AQH0OguJjSL7Q/profile-displayphoto-shrink_400_400/B56Zco0OXZGoAg-/0/1748736468942?e=1754524800&v=beta&t=ZfFOtdY6WaktnEQ0jT_FlfhyYZ8Rju0Z1ZVWMwUCWS0'
    // }

    await this.channelModel.findOneAndUpdate(
      { channelId: userInfoRes.data.sub, user: new Types.ObjectId(userId) },
      {
        user: new Types.ObjectId(userId),
        workspace: new Types.ObjectId(),
        handle: 'linkedin',
        accesstoken: accessToken,
        refreshtoken: accessToken,
        idToken: tokenRes.data.id_token,
        channelId: userInfoRes.data.sub,
        channelName: userInfoRes.data.name,
        channelPicture: userInfoRes?.data?.picture || '',
      },
      { upsert: true, new: true },
    );

    return {
      success: true,
      message: 'Linkedin page connected successfully',
    };
  }

  async publish(post: Post): Promise<PostResponse> {
    const channel = await this.channelModel.findById(post.channelId);
    if (!channel) throw new Error('Channel not found for publishing');

    const accessToken = channel.accesstoken;

    const author = `urn:li:person:${channel.channelId}`;
    // console.log('meRes', meRes);

    let imageAssets: string[] = [];

    const uploadImage = async (imageUrl: string): Promise<string> => {
      const registerRes = await axios.post(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: author,
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent',
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const uploadUrl =
        registerRes.data.value.uploadMechanism[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl;
      const asset = registerRes.data.value.asset;

      const image = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      await axios.put(uploadUrl, image.data, {
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      return asset;
    };

    if (post.media?.length) {
      for (const imageUrl of post.media) {
        const asset = await uploadImage(imageUrl);
        imageAssets.push(asset);
      }
    }

    const body = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.text,
          },
          shareMediaCategory: imageAssets.length ? 'IMAGE' : 'NONE',
          media: imageAssets.map((asset) => ({
            status: 'READY',
            media: asset,
          })),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    console.log('body', body);

    const res = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      status: 'posted',
      postId: res.data.id,
      id: post._id?.toString() ?? post.postId,
      releaseURL: `https://www.linkedin.com/feed/update/${res.data.id.replace('urn:li:share:', '')}`,
    };
  }
}
