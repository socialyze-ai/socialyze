import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { OpenAiService } from '../service/openai.service';

@Module({
  controllers: [AiController],
  providers: [AiService, OpenAiService],
})
export class AiModule {}
