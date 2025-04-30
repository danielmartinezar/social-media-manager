/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { FindNearbyParams, NearbyRestaurantDto } from './maps.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MapsService {
  private readonly OVERPASS_API: string;
  constructor(private readonly config: ConfigService) {
    this.OVERPASS_API = this.config.get<string>('OVERPASS_API_URL') ?? '';
  }

  async findNearbyRestaurants(
    params: FindNearbyParams,
  ): Promise<NearbyRestaurantDto[]> {
    const { city, lat, lon, radius = 1000 } = params;

    let query: string;

    if (city) {
      // Search within an area by city name
      query = `
        [out:json];
        area["name"="${city}"]->.searchArea;
        node["amenity"="restaurant"](area.searchArea);
        out;
      `;
    } else if (lat != null && lon != null) {
      // Search around provided coordinates
      query = `
        [out:json];
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        out;
      `;
    } else {
      throw new BadRequestException(
        'Either city or latitude and longitude must be provided',
      );
    }

    // Perform Overpass API request
    const response = await axios.post(
      this.OVERPASS_API,
      new URLSearchParams({ data: query }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return response.data.elements.map((place: any) => {
      const dto: NearbyRestaurantDto = {
        id: place.id,
        name: place.tags?.name || 'Unnamed',
        cuisine: place.tags?.cuisine || 'Unknown',
        lat: place.lat,
        lon: place.lon,
      };
      return dto;
    });
  }
}
