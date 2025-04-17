import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GetImagesDto } from '../media/dto/getImages.dto';

@Injectable()
export class GiphyService {
  async getTrendingGifs(getImagesDto: GetImagesDto) {
    const apiKey = process.env.GIPHY_API_KEY;
    const limit = getImagesDto.limit || 10;
    const offset = (getImagesDto.page - 1) * limit;

    try {
      const response = await axios.get(
        'https://api.giphy.com/v1/gifs/trending',
        {
          params: {
            api_key: apiKey,
            limit,
            offset,
            rating: 'g',
          },
        },
      );

      const media = response.data.data.map((gif: any) => ({
        url: gif.images.original.url,
        download_location: gif.images.original.url,
        username: gif.user?.display_name || gif.username || 'Unknown',
        profile_url:
          gif.user?.profile_url || `https://giphy.com/${gif.username}`,
        alt_description: gif.title || 'GIF',
        width: parseInt(gif.images.original.width, 10),
        height: parseInt(gif.images.original.height, 10),
      }));

      //   return {
      //     media,
      //     giphy_url: 'https://giphy.com/',
      //     page: getImagesDto.page,
      //     limit,
      //   };

      return response.data;
    } catch (error) {
      return {
        error: 'Failed to fetch trending GIFs from Giphy',
        details: error.response?.data || error.message,
      };
    }
  }
}
