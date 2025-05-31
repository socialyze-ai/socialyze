import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SupaDataService {
  private readonly apiKey = process.env.SUPADATA_API_KEY;

  async getTranscription(url: string): Promise<any> {
    const endpoint = 'https://api.supadata.ai/v1/youtube/transcript';
    try {
      const response = await axios.get(endpoint, {
        params: { url },
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      const transcriptText =
        response.data?.content
          ?.map((item: { text: string }) => item.text)
          .join(' ') || '';

      return transcriptText;
    } catch (error) {
      console.error(
        'Error fetching transcription:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async getArticleContent(url: string): Promise<any> {
    const endpoint = 'https://api.supadata.ai/v1/web/scrape';
    try {
      const response = await axios.get(endpoint, {
        params: { url },
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data?.content;
    } catch (error) {
      console.error(
        'Error fetching transcription:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
