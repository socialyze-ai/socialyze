import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from './channel.model';
import { ServiceModule } from '../service/service.module';
import { FacebookService } from '../service/facebook.service';
import {
  OAuthSession,
  OAuthSessionSchema,
} from 'src/schema/oauthsession.schema';
import { InstagramService } from '../service/instagram.service';
import { XService } from '../service/x.service';
import { LinkedinService } from '../service/linkedin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: OAuthSession.name, schema: OAuthSessionSchema },
    ]),
    ServiceModule,
  ],
  controllers: [ChannelController],
  providers: [
    ChannelService,
    FacebookService,
    InstagramService,
    XService,
    LinkedinService,
  ],
})
export class ChannelModule {}
