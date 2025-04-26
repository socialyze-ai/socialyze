import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('generateRandomContent')
  generateRandomContent() {
    return this.aiService.generateRandomContent();
  }

  @Post('generateContent')
  generateContent(
    @Body() body: { text: string; action: string; tone?: string },
  ) {
    return this.aiService.generateContent(body.text, body.action, body.tone);
  }

  @Post('generateHashTags')
  generateHashTags(@Body() body: { text: string }) {
    return this.aiService.generateHashTags(body.text);
  }

  @Post('completeContent')
  completeContent(@Body() body: { text: string }) {
    return this.aiService.completeContent(body.text);
  }
}
