// google-image.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GetImagesDto } from '../media/dto/getImages.dto';

@Injectable()
export class GoogleImageService {
  async getImages(getImagesDto: GetImagesDto) {
    const { search, page, limit } = getImagesDto;
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CSE_ID;

    if (!search) {
      return { error: 'Search term is required for Google image search.' };
    }

    try {
      const startIndex = (page - 1) * limit + 1;

      const response = await axios.get(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            key: apiKey,
            cx,
            q: search,
            searchType: 'image',
            start: startIndex,
            num: limit,
          },
        },
      );

      const transformed = {
        media: response.data.items.map((item: any) => ({
          url: item.link,
          download_location: item.link,
          username: item.displayLink,
          profile_url: item.image.contextLink,
          alt_description: item.snippet,
          width: item.image.width,
          height: item.image.height,
          fileFormat: item.fileFormat,
        })),
        page,
        limit,
      };

      return transformed;
    } catch (error) {
      return {
        error: 'Failed to fetch images from Google Search',
        details: error.response?.data || error.message,
      };
    }
  }
}
