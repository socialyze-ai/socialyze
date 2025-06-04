import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './post.model';
import { MongooseModule } from '@nestjs/mongoose';
import { FacebookService } from '../service/facebook.service';
import { InstagramService } from '../service/instagram.service';
import { XService } from '../service/x.service';
import { ServiceModule } from '../service/service.module';
import { Channel, ChannelSchema } from '../channel/channel.model';
import {
  OAuthSession,
  OAuthSessionSchema,
} from 'src/schema/oauthsession.schema';
import { LinkedinService } from '../service/linkedin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: OAuthSession.name, schema: OAuthSessionSchema },
    ]),
    ServiceModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    FacebookService,
    InstagramService,
    XService,
    LinkedinService,
  ],
})
export class PostModule {}
