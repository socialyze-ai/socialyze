import { Module } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from '../channel/channel.model';
import { User, UserSchema } from '../user/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: User.name, schema: UserSchema }, // ✅ Import UserModel
    ]),
  ],
  providers: [FacebookService],
  exports: [FacebookService],
})
export class ServiceModule {}
