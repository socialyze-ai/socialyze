// src/hashtagManager/hashtagManager.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HashtagManagerService } from './hashtagManager.service';
import { HashtagManagerController } from './hashtagManager.controller';
import { HashtagManager, HashtagManagerSchema } from './hashtagManager.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HashtagManager.name, schema: HashtagManagerSchema },
    ]),
  ],
  controllers: [HashtagManagerController],
  providers: [HashtagManagerService],
})
export class HashtagManagerModule {}
