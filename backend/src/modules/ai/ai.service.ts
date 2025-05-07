import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAiService } from '../service/openai.service';

@Injectable()
export class AiService {
  constructor(private readonly openAiService: OpenAiService) {}

  async generateRandomContent() {
    const prompt = 'Generate a random short social media post.';
    const reponse = await this.openAiService.generate(prompt, '');
    return { text: reponse };
  }
  async generateContent(text: string, action: string, tone?: string) {
    let prompt: string;

    if (!/[a-zA-Z]/.test(text.trim())) {
      throw new BadRequestException(
        'Input must contain meaningful text with at least one letter.',
      );
    }

    switch (action) {
      case 'generate':
        prompt = `You are a Social Media Content Writer. Write a social media post in a ${tone || 'natural'} tone with relevant hashtags.

                  🔒 Format rules:
                  - Return STRICTLY a valid JSON array containing exactly 3 strings.
                  - DO NOT add any characters outside the JSON array.
                  - DO NOT add explanations, greetings, or extra formatting.
                  - Each string should be a social media post suitable for platforms like Instagram, Facebook or Twitter.
                  - Ensure the output is valid JSON parsable by JSON.parse()

                  🎯 Example:
                  [
                    "Exciting news! 🌟 We have three amazing marketing campaigns in the works. Which one are you most looking forward to? #MarketingStrategy #DigitalMarketing",
                    "Calling all marketing enthusiasts! 📢 We need your help to choose the next big marketing move. Which option do you think will capture everyone's attention? #MarketingCampaigns #SocialMediaMarketing",
                    "Hey everyone! 👋 Get ready for some fresh marketing ideas coming your way. Which one do you think will make the biggest impact on our audience? #InnovativeMarketing #CreativeCampaigns"
                  ]`;
        break;

      case 'rephrase':
        prompt = `You are a Social Media Content Writer. Rephrase the following social media post in a ${tone || 'natural'} tone with relevant hashtags.

                  🔒 Format rules:
                  - Return STRICTLY a valid string
                  - DO NOT include any extra characters, comments, or formatting.
                  - DO NOT explain what you did or why.

                  🎯 Example input:
                  "Calling all marketing enthusiasts! 📢 We need your help to choose the next big marketing move."

                  ✅ Example output:
                  "Hey marketers! 🚀 Help us decide on the next bold move in our strategy. #MarketingCommunity #NextBigThing`;
        break;

      case 'expand':
        prompt = `You are a Social Media Content Writer. Expand the following short social media post to make it more descriptive, engaging, and informative, while keeping a ${tone || 'natural'} tone and including relevant hashtags.

                  🔒 Format rules:
                  - You MUST increase the word count by AT LEAST 50%.
                  - Do NOT simply rephrase — add more **details**, **context**, **emotions**, or **engagement questions**.
                  - Include emojis and relevant hashtags.
                  - Keep it as a SINGLE valid string — no arrays, formatting, or code.
                  - The output MUST be directly parsable by JSON.parse() if wrapped in quotes.

                  🎯 Example input:
                  "Big update coming soon!"

                  ✅ Example output:
                  "We're thrilled to announce that something BIG is on the horizon! 🚀 Our team has been working behind the scenes on an exciting new feature that will take your experience to the next level. Stay tuned for more updates! #BigUpdate #TechNews #StayTuned"
`;
        break;

      case 'shorten':
        prompt = `Shorten this post while keeping the meaning:\n"${text}"`;
        break;

      case 'complete':
        prompt = `You are a helpful writing assistant. Your task is to **complete the given incomplete sentence or thought** in a coherent, natural-sounding way.

                  🔒 Format rules:
                  - Return ONLY the **missing or additional part** required to make the sentence complete.
                  - DO NOT repeat the original text.
                  - DO NOT add quotes, explanations, or extra formatting.
                  - The completion should smoothly follow the existing text.

                  🎯 Example:
                  Input: I love to visit Delhi.
                  Output: because of its delicious food and vibrant culture.`;
        break;

      case 'refine':
        prompt = `You are a professional editor. Your task is to refine the given paragraph for grammar, clarity, sentence structure, and tone. Even if the input seems mostly correct, polish it to be clear, natural.

                  🔒 Format rules:
                  - Always return an improved version — fix grammar, sentence flow, or awkward phrasing.
                  - Do not return the exact input unless it is truly flawless.
                  - Do NOT include explanations or formatting — only return the refined text.
`;
        break;
      default:
        throw new BadRequestException('Invalid action');
    }

    let response = await this.openAiService.generate(prompt, text);
    if (action === 'generate') {
      response = JSON.parse(response);
    }

    return { text: response };
  }

  async generateHashTags(text: string) {
    const prompt = `Generate 5-6 relevant and trending hashtags for the given post. Please do not include numbers or new lines in your response`;
    const reponse = await this.openAiService.generate(prompt, text);
    return { text: reponse };
  }

  async completeContent(text: string) {
    const prompt = `You are a helpful writing assistant. Your task is to **complete the given incomplete sentence or thought** in a coherent, natural-sounding way.

                  🔒 Format rules:
                  - Return ONLY the **missing or additional part** required to make the sentence complete.
                  - DO NOT repeat the original text.
                  - DO NOT add quotes, explanations, or extra formatting.
                  - The completion should smoothly follow the existing text.

                  🎯 Example:
                  Input: I love to visit Delhi.
                  Output: because of its delicious food and vibrant culture.`;
    const reponse = await this.openAiService.generate(prompt, text);
    return { text: reponse };
  }
}
