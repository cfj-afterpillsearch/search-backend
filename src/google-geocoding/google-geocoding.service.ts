import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GoogleGeocodingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getAddress(latitude: number, longitude: number) {
    const API_KEY = this.configService.get<string>('GOOGLE_GEOCODING_API_KEY');
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;

    const response = await this.httpService.axiosRef.get(url, {
      params: {
        key: API_KEY,
        latlng: `${latitude},${longitude}`,
        language: 'ja',
      },
    });

    const todofuken = response.data.results[0].address_components.filter(
      (item) => item.types.includes('administrative_area_level_1'),
    )[0].long_name;
    const shikuchoson = response.data.results[0].address_components.filter(
      (item) => item.types.includes('locality'),
    )[0].long_name;
    return { todofuken, shikuchoson };
  }
}
