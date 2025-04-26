import { BadRequestException, Injectable } from '@nestjs/common';
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
        prompt = `Write a social media in ${tone || 'natural'} tone, with relevant hashtags about: "${text}". Each response should have 3 option. Reply in JSON format like: ["This is option 1", "This is option 2", "This is option 3"]`;
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
        prompt = `Complete the incomplete sentence.
                  Reply only the extra part.

                  Example: 
                  Prompt - I love to visit Delhi.
                  Completed Sentence - I love to Delhi because of delicious food.
                  Your response should be - because of delicious food
                  
                  Text: ${text}`;
        break;
      case 'refine':
        prompt = `Refine only focused text for grammar and quality.\n\n Focused text: \n "${text}`;
        break;
      default:
        throw new BadRequestException('Invalid action');
    }

    let response = await this.openAiService.generate(prompt);
    if (action === 'generate') {
      response = JSON.parse(response);
    }

    return { text: response };
  }

  async generateHashTags(text: string) {
    const prompt = `Generate 5-6 relevant and trending hashtags for this post:\n"${text}"`;
    const reponse = await this.openAiService.generate(prompt);
    return { text: reponse };
  }

  async completeContent(text: string) {
    const prompt = `Complete the following sentence or paragraph naturally:\n"${text}" \n\n No numbers, only hashtags seperated with space.`;
    const reponse = await this.openAiService.generate(prompt);
    return { text: reponse };
  }
}
