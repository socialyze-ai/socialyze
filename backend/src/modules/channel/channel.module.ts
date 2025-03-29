import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from './channel.model';
import { ServiceModule } from '../service/service.module';
import { FacebookService } from '../service/facebook.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    ServiceModule,
  ],
  controllers: [ChannelController],
  providers: [ChannelService, FacebookService],
})
export class ChannelModule {}
