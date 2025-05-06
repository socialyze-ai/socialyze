import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GetImagesDto } from '../media/dto/getImages.dto';

@Injectable()
export class PexelsService {
  async getImages(getImagesDto: GetImagesDto) {
    const apiKey = process.env.PEXELS_API_KEY;
    const baseUrl = 'https://api.pexels.com/v1/';

    try {
      const isSearch = !!getImagesDto.search;
      const endpoint = isSearch ? 'search' : 'curated';

      const url = `${baseUrl}${endpoint}`;
      const params: any = {
        query: getImagesDto.search,
        page: getImagesDto.page || 1,
        per_page: getImagesDto.limit || 10,
      };

      if (!isSearch) delete params.query;

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: apiKey,
        },
      });

      const rawPhotos = response.data.photos;

      const transformedResponse = {
        media: rawPhotos.map((photo: any) => ({
          url: photo.src?.medium,
          username: photo.photographer,
          profile_url: photo.photographer_url,
          alt_description: photo.alt,
          width: photo.width,
          height: photo.height,
        })),
        pexels_url: 'https://pexels.com/',
        page: response.data.page,
        limit: response.data.per_page,
        next: response.data.page + 1,
        total_results: response.data.total_results,
      };

      return transformedResponse;
    } catch (error) {
      return {
        error: 'Failed to fetch images from Pexels',
        details: error.response?.data || error.message,
      };
    }
  }
}
