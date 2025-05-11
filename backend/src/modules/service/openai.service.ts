// openai.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string, userInput: string): Promise<string> {
    let messages = [];
    if (userInput) {
      messages = [
        { role: 'system', content: prompt },
        { role: 'user', content: userInput },
      ];
    } else {
      messages = [{ role: 'user', content: prompt }];
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || '';
  }
}
