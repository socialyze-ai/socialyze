import { Module } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from '../channel/channel.model';
import { User, UserSchema } from '../user/user.model';
import {
  OAuthSession,
  OAuthSessionSchema,
} from 'src/schema/oauthsession.schema';
import { Post, PostSchema } from '../post/post.model';
import { InstagramService } from './instagram.service';
import { XService } from './x.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: OAuthSession.name, schema: OAuthSessionSchema },
    ]),
  ],
})
export class ServiceModule {}
