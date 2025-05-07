// google-image.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GetImagesDto } from '../media/dto/getImages.dto';

@Injectable()
export class TenorService {
  async getImages(getImagesDto: GetImagesDto) {
    const apiKey = process.env.TENOR_API_KEY;
    const baseUrl = 'https://tenor.googleapis.com/v2/';

    try {
      const isSearch = !!getImagesDto.search;
      const endpoint = isSearch ? 'search' : 'featured';

      const url = `${baseUrl}${endpoint}`;
      const params: any = {
        key: apiKey,
        q: getImagesDto.search,
        limit: getImagesDto.limit,
        pos: getImagesDto.page, // Tenor uses `pos` for pagination, not `page`
        media_filter: 'minimal',
        contentfilter: 'high',
      };

      if (!isSearch) delete params.q;

      const response = await axios.get(url, { params });

      const rawResults = response.data.results;

      const transformedResponse = {
        media: rawResults.map((item: any) => ({
          url: item.media_formats?.gif?.url,
          duration: item.media_formats?.gif?.duration,
          width: item.media_formats?.gif?.dims?.[0],
          height: item.media_formats?.gif?.dims?.[1],
          alt_description: item.content_description,
        })),
        tenor_url: `https://tenor.com/`,
        page: getImagesDto.page,
        limit: getImagesDto.limit,
        next: response.data.next, // for fetching next page
      };

      return transformedResponse;
    } catch (error) {
      return {
        error: 'Failed to fetch images from Tenor',
        details: error.response?.data || error.message,
      };
    }
  }
}
