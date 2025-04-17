import { Injectable } from '@nestjs/common';
import { OpenAiService } from '../service/openai.service';

@Injectable()
export class AiService {
  constructor(private readonly openAiService: OpenAiService) {}

  async generateRandomContent() {
    const prompt = 'Generate a random short social media post.';
    const reponse = await this.openAiService.generate(prompt);
    return { text: reponse };
  }
  async generateContent(text: string, action: string, tone?: string) {
    let prompt: string;

    switch (action) {
      case 'generate':
        prompt = `Write a social media post about: "${text}".`;
        break;
      case 'rephrase':
        prompt = `Rephrase the following post in a ${tone || 'natural'} tone:\n"${text}"`;
        break;
      case 'expand':
        prompt = `Expand this short social media post to be more descriptive:\n"${text}"`;
        break;
      case 'shorten':
        prompt = `Shorten this post while keeping the meaning:\n"${text}"`;
        break;
      case 'complete':
        prompt = `Complete this unfinished sentence:\n"${text}"`;
        break;
      default:
        return { text: 'Invalid action' };
    }

    const reponse = await this.openAiService.generate(prompt);
    return { text: reponse };
  }

  async generateHashTags(text: string) {
    const prompt = `Generate 3-5 relevant and trending hashtags for this post:\n"${text}"`;
    const reponse = await this.openAiService.generate(prompt);
    return { text: reponse };
  }

  async completeContent(text: string) {
    const prompt = `Complete the following sentence or paragraph naturally:\n"${text}"`;
    const reponse = await this.openAiService.generate(prompt);
    return { text: reponse };
  }
}
